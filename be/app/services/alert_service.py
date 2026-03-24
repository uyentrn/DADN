import smtplib
import threading
from email.message import EmailMessage
from datetime import datetime, timedelta
from flask import current_app
from apscheduler.schedulers.background import BackgroundScheduler

# ==========================================
# CONSTANTS & CONFIGURATION KEYS
# ==========================================

# Database Collections & Fields
PREDICT_MODULE = 'predictModule'
ID_FIELD = '_id'
ID_SENSOR = 'idSensor'
IS_EMAIL_PROCESSED = 'is_email_processed'
CONTAMINATION_RISK = 'contamination_risk'
WQI_SCORE = 'wqi_score'
TIME_AGO = 'time_ago'
CREATED_AT = 'created_at'
STATUS = 'status'
FORECAST_24H = 'forecast_24h'
CONFIDENCE = 'confidence'
MESSAGE = 'message'

# Specific Values
LOW_RISK = 'Low Risk'
STATUS_UNREAD = 'unread'

# App Config Keys
CONF_EMAIL = 'EMAIL'
CONF_PASSWORD = 'PASSWORD'
CONF_ALERT_EMAIL_TO = 'ALERT_EMAIL_TO'
CONF_SMTP_SERVER = 'SMTP_SERVER'
CONF_SMTP_PORT = 'SMTP_PORT'


class AlertServiceError(Exception):
    """Custom exception class for errors related to the Alert Service."""
    pass

class AlertService:
    
    @staticmethod
    def _get_severity_from_wqi(wqi_score):
        """
        [PRIVATE] Standardizes the Water Quality Index (WQI) into a severity level (1 to 5).
        A lower WQI score indicates a higher severity/risk level.

        Args:
            wqi_score (float/int/str): The Water Quality Index score provided by the AI.

        Returns:
            int: The severity level ranging from 1 (Safe) to 5 (Critical). 
                 Returns 0 if the input is invalid or cannot be parsed.
        """
        try:
            wqi = float(wqi_score)
            if wqi >= 76: return 1  # Safe / Excellent
            if wqi >= 51: return 2  # Attention / Average
            if wqi >= 26: return 3  # Warning / Poor
            if wqi >= 10: return 4  # High Risk / Heavily Polluted
            return 5                # Critical / Severely Polluted
        except (ValueError, TypeError):
            return 0 

    @staticmethod
    def _should_send_email(db, device_id, new_ai_data):
        """
        [PRIVATE] Evaluates whether an alert email should be sent based on Anti-Spam (Cooldown) and Escalation rules.

        Args:
            db (MongoClient.database): The active MongoDB database instance.
            device_id (str): The unique identifier of the sensor.
            new_ai_data (dict): The latest AI prediction data payload.

        Returns:
            bool: True if the email should be sent, False if it should be suppressed.
        """
        predict_collection = db[PREDICT_MODULE]
        
        # Retrieve the most recent processed alert for this specific device
        # We only care about alerts that previously triggered an email and were not "Low Risk"
        last_alert = predict_collection.find_one(
            {
                ID_SENSOR: device_id,
                IS_EMAIL_PROCESSED: True, 
                CONTAMINATION_RISK: {"$ne": LOW_RISK}
            },
            sort=[(TIME_AGO, -1)] 
        )
        
        # If there is no history of alerts, approve sending immediately
        if not last_alert:
            return True 
            
        current_wqi = new_ai_data.get(WQI_SCORE, 100)
        last_wqi = last_alert.get(WQI_SCORE, 100)

        current_severity = AlertService._get_severity_from_wqi(current_wqi)
        last_severity = AlertService._get_severity_from_wqi(last_wqi)

        # 1. ESCALATION RULE: If the water quality worsens (severity increases), send immediately
        if current_severity > last_severity:
            return True

        # 2. ANTI-SPAM RULE: If the situation is unchanged or improving, apply a cooldown period
        hour_delay_offset = 2
        last_time = last_alert.get(CREATED_AT) 
        
        if last_time and (datetime.now() - last_time) < timedelta(hours=hour_delay_offset):
            # Suppress the email to prevent spamming the user
            return False 
                
        return True

    @staticmethod
    def send_warning_email_directly(app, device_id, ai_data):
        """
        [PUBLIC] Forces the system to send an alert email immediately.
        This method is thread-safe and can be called by external modules (e.g., an Admin dashboard).

        Args:
            app (Flask): The current Flask application instance (required for accessing config in threads).
            device_id (str): The unique identifier of the sensor.
            ai_data (dict): The AI prediction data payload containing WQI, risk, etc.
        """
        with app.app_context():
            sender_email = app.config.get(CONF_EMAIL)
            sender_password = app.config.get(CONF_PASSWORD)
            recipient_email = app.config.get(CONF_ALERT_EMAIL_TO, sender_email)

            if not sender_email or not sender_password:
                print("Error: SMTP Email/Password are not configured in environment variables.")
                return

            # Extract data with safe fallbacks
            wqi = ai_data.get(WQI_SCORE, 'N/A')
            risk = ai_data.get(CONTAMINATION_RISK, 'Unknown')
            forecast = ai_data.get(FORECAST_24H, 'Unknown')
            confidence = ai_data.get(CONFIDENCE, 'N/A')
            message_detail = ai_data.get(MESSAGE, 'Water quality is at a dangerous level.')

            # Construct the HTML email template
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <div style="max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #d9534f; text-align: center;"> WATER QUALITY ALERT </h2>
                    <p>Device: <b>{device_id}</b></p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                        <tr style="background-color: #f8d7da; color: #721c24;">
                            <td style="padding: 10px; border: 1px solid #ddd;"><b>Risk Level</b></td>
                            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">{risk}</td>
                        </tr>
                        <tr><td style="padding: 10px; border: 1px solid #ddd;"><b>WQI</b></td><td style="padding: 10px; border: 1px solid #ddd;">{wqi}</td></tr>
                        <tr><td style="padding: 10px; border: 1px solid #ddd;"><b>Forecast</b></td><td style="padding: 10px; border: 1px solid #ddd;">{forecast}</td></tr>
                    </table>
                    <p style="background-color: #e9ecef; padding: 15px;">{message_detail}</p>
                </div>
            </body>
            </html>
            """

            # Initialize the EmailMessage object
            message = EmailMessage()
            message["Subject"] = f"Urgent: Water Quality Alert - {device_id}"
            message["From"] = sender_email
            message["To"] = recipient_email
            message.set_content("Please enable HTML to view this email.")
            message.add_alternative(html_content, subtype='html')

            # Execute the SMTP connection and send the email
            try:
                with smtplib.SMTP(app.config.get(CONF_SMTP_SERVER, "smtp.gmail.com"), int(app.config.get(CONF_SMTP_PORT, 587))) as smtp:
                    smtp.starttls()
                    smtp.login(sender_email, sender_password)
                    smtp.send_message(message)
                    print(f"Alert email successfully sent for device {device_id}")
            except Exception as exc:
                print(f"Failed to send alert email: {exc}")

    # ==========================================
    # SCHEDULER & BACKGROUND PROCESSING
    # ==========================================

    @staticmethod
    def _scan_unprocessed_alerts(app, db):
        """
        [PRIVATE] Background job executed by the Scheduler.
        Scans MongoDB for newly inserted AI predictions and processes them for email alerts.

        Args:
            app (Flask): The current Flask application instance.
            db (MongoClient.database): The active MongoDB database instance.
        """
        predict_collection = db[PREDICT_MODULE]
        
        # Query for all newly inserted records that haven't been evaluated for emails
        unprocessed_alerts = predict_collection.find({IS_EMAIL_PROCESSED: False})

        for alert in unprocessed_alerts:
            device_id = alert.get(ID_SENSOR)
            current_wqi = alert.get(WQI_SCORE, 100)
            
            # Only process alerts if the water is NOT safe (Severity > 1)
            if AlertService._get_severity_from_wqi(current_wqi) > 1:
                
                # Evaluate Spam and Escalation constraints
                if AlertService._should_send_email(db, device_id, alert):
                    AlertService.send_warning_email_directly(app, device_id, alert)
            
            # Always mark as processed, regardless of whether an email was sent or skipped,
            # to prevent infinite loops in the next scheduler tick.
            predict_collection.update_one(
                {ID_FIELD: alert[ID_FIELD]},
                {"$set": {IS_EMAIL_PROCESSED: True}}
            )

    @staticmethod
    def init_background_scheduler(app, db):
        """
        [PUBLIC] Initializes and starts the Background Scheduler.
        This method should be called exactly ONCE during the Flask application startup.

        Args:
            app (Flask): The current Flask application instance.
            db (MongoClient.database): The active MongoDB database instance.
        """
        scheduler = BackgroundScheduler()
        
        # Configure the job to run the scanner every 60 seconds
        scheduler.add_job(
            func=AlertService._scan_unprocessed_alerts, 
            args=[app, db], 
            trigger="interval", 
            seconds=60
        )
        scheduler.start()
        print(" AlertService Background Scheduler started! Polling every 60s...")