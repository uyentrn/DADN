import os

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
import numpy as np
from datetime import datetime

from app.infrastructure.persistence.mongo.connection import get_mongo_database


FEATURE_COLUMNS = [
    "Temp",
    "Turbidity",
    "DO",
    "BOD",
    "CO2",
    "pH",
    "Alkalinity",
    "Hardness",
    "Calcium",
    "Ammonia",
    "Nitrite",
    "Phosphorus",
    "H2S",
    "Plankton",
]


class AIModelService:
    def __init__(self):
        self.MODEL_PATH = "water_model.pkl"
        self.model = None
        self.load_model()
    
    def auto_train(self):
        if os.path.exists(self.MODEL_PATH):
            os.remove(self.MODEL_PATH)
            print("Removed old model file")
        
        excel_file = "WQD.xlsx"
        if os.path.exists(excel_file):
            print("Training from WQD.xlsx file...")
            try:
                df = pd.read_excel(excel_file)
                result = self.train_model_from_dataframe(df)
                if "error" not in result:
                    print("Auto-trained AI model from WQD.xlsx")
                    return
                else:
                    print(f"Failed to train from WQD.xlsx: {result['error']}")
            except Exception as e:
                print(f"Error reading WQD.xlsx: {e}")
        
        print("Training from database...")
        result = self.train_model_from_db()
        if "error" not in result:
            print("Auto-trained AI model from database")
        else:
            print("No labeled data available for training - model not loaded")

    def load_model(self):
        if os.path.exists(self.MODEL_PATH):
            self.model = joblib.load(self.MODEL_PATH)

    def test_db(self):
        db = get_mongo_database()
        if db is None:
            return {"error": "MongoDB not connected"}
        count = db.get_collection("predictions").count_documents({})
        return {"record_count": int(count)}

    def train_model_from_file(self, file):
        df = pd.read_excel(file)
        return self.train_model_from_dataframe(df)

    def train_model_from_dataframe(self, df):
        df.columns = (
            df.columns
            .str.replace(r"\(.*?\)", "", regex=True)
            .str.replace("-", "")
            .str.strip()
        )

        if "Water Quality" not in df.columns:
            return {"error": "File must contain a 'Water Quality' column"}

        X = df[FEATURE_COLUMNS]
        y = df["Water Quality"]

        if len(X) < 2:
            return {"error": "Need at least 2 samples for training"}

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        self.model = RandomForestClassifier()
        self.model.fit(X_train, y_train)

        acc = accuracy_score(y_test, self.model.predict(X_test))
        joblib.dump(self.model, self.MODEL_PATH)

        return {
            "message": "Model trained successfully from Excel file",
            "accuracy": float(acc),
        }

    def train_model_from_db(self):
        db = get_mongo_database()
        if db is None:
            return {"error": "MongoDB not connected"}

        coll = db.get_collection("predictions")
        cursor = coll.find({"quality_name": {"$exists": True, "$ne": None}})
        docs = list(cursor)

        if not docs:
            return {"error": "No labeled data available for training"}

        df = pd.DataFrame([
            {
                **{col: (doc.get(col) if doc.get(col) is not None else 0) for col in FEATURE_COLUMNS},
                "label": doc.get("quality_name"),
            }
            for doc in docs
        ])

        X = df[FEATURE_COLUMNS]
        y = df["label"]

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        self.model = RandomForestClassifier()
        self.model.fit(X_train, y_train)

        acc = accuracy_score(y_test, self.model.predict(X_test))
        joblib.dump(self.model, self.MODEL_PATH)

        return {
            "message": "Model trained successfully from DB",
            "accuracy": float(acc),
        }

    def predict(self, data):
        if self.model is None:
            self.load_model()
            if self.model is None:
                self.auto_train()
                if self.model is None:
                    return {"error": "Model not loaded"}

        features = {col: float(data.get(col, 0)) for col in FEATURE_COLUMNS}
        df = pd.DataFrame([features])

        # prediction is value 0,1,2 for Excellent, Good, Poor respectively. 
        # We will convert it to WQI score and label in the response
        prediction = self.model.predict(df)[0]

        proba = self.model.predict_proba(df)[0]
        proba = np.asarray(proba, dtype=float)

        class_values = self.model.classes_
        expected_class = float(np.dot(proba, class_values))

        # wqi_score is calculated as a weighted score based on the expected class value, normalized to a 0-100 scale
        wqi_score = (1 - expected_class / 2.0) * 100

        # confidence %
        max_p = float(np.max(proba))
        confidence_score = max_p * 100.0

        wqi_label = self.getWqiLabel(wqi_score)
        risk_status, risk_level = self.getRiskFromWQILabel(wqi_label)

        # forecast_24h range is calculated based on the confidence of the prediction
        # if confidence is high, we expect less variation in the next 24h, if confidence is low, we expect more variation.
        # The range is centered around the predicted WQI score and expands more if confidence is low.
        delta = max(1.0, (1.0 - max_p) * 10.0)
        low = max(0.0, wqi_score - delta)
        high = min(100.0, wqi_score + delta)

        # trend is stable if delta is small, unstable if delta is large
        trend = "Stable" if delta <= 3.0 else "Unstable"

        return {
            "wqi": {"prediction": int(prediction),"score": float(wqi_score), "max": 100, "label": wqi_label},
            "contamination_risk": {"status": risk_status, "risk_level": int(risk_level)},
            "forecast_24h": {
                "trend": trend,
                "predicted_wqi_range": [float(low), float(high)],
                "model_used": "Random Forest",
                "confidence_score": float(confidence_score),
            },
            "solution": self._solution_for(wqi_label),
        }
        
    def getWqiLabel(self, wqi_score: float) -> str:
        if wqi_score >= 90:
            return "Excellent"
        if wqi_score >= 70:
            return "Good"
        if wqi_score >= 50:
            return "Poor"
        return "Poor"

    def getRiskFromWQILabel(self, label: str):
        mapping = {
            "Excellent": ("Low Risk", 0),
            "Good": ("Medium Risk", 1),
            "Poor": ("High Risk", 2),
        }
        return mapping.get(label, ("Unknown", 7))

    def _solution_for(self, quality_name: str) -> str:
        mapping = {
            "Good": "Monitor regularly.",
            "Moderate": "Consider treatment.",
            "Poor": "Immediate action required.",
        }
        return mapping.get(quality_name, "Check water quality parameters and adjust accordingly.")