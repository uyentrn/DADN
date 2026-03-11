import requests
from flask import current_app


class AIClientError(Exception):
    pass


class AIClient:
    @staticmethod
    def predict(value):
        try:
            response = requests.post(
                current_app.config["AI_SERVICE_URL"],
                json={"x": value},
                timeout=current_app.config["AI_SERVICE_TIMEOUT"],
            )
            response.raise_for_status()
        except requests.RequestException as exc:
            raise AIClientError("Failed to connect to AI service") from exc

        try:
            data = response.json()
        except ValueError as exc:
            raise AIClientError("AI service returned invalid JSON") from exc

        if "value" not in data or "status" not in data:
            raise AIClientError("AI service response is missing required fields")

        return data
