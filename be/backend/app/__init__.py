from flask import Flask, jsonify

from app.config import Config
from app.database.db import db
from app.routes.auth_routes import auth_bp
from app.routes.sensor_routes import sensor_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)

    with app.app_context():
        db.create_all()

    app.register_blueprint(auth_bp)
    app.register_blueprint(sensor_bp)

    @app.get("/health")
    def health_check():
        return jsonify({"status": "ok"}), 200

    return app
