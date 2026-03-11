import pandas as pd
import joblib
import os
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from pymongo import MongoClient
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

MODEL_PATH = "water_model.pkl"
model = None

# MongoDB
client = MongoClient("mongodb+srv://phucloctho054:AvKHdS4VzSV6zZhZ@cluster0.kaob2.mongodb.net/")

db = client["water_quality_db"]
collection = db["sensor_data"]

# CORS (React frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================
# LOAD MODEL
# =============================
def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)

load_model()

@app.get("/test-db")
async def test_db():
    test = collection.insert_one({"status": "connected"})
    return {"id": str(test.inserted_id)}


# =============================
# TRAIN MODEL
# =============================
@app.post("/train")
async def train_model(file: UploadFile = File(...)):
    global model

    df = pd.read_excel(file.file)

    # chuẩn hóa tên cột
    df.columns = (
        df.columns
        .str.replace(r"\(.*?\)", "", regex=True)  # bỏ (mg/L)
        .str.replace("-", "")
        .str.strip()
    )

    X = df.drop("Water Quality", axis=1)
    y = df["Water Quality"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestClassifier()

    model.fit(X_train, y_train)

    acc = accuracy_score(y_test, model.predict(X_test))

    joblib.dump(model, MODEL_PATH)

    return {
        "message": "Model trained successfully",
        "accuracy": float(acc)
    }

# @app.post("/train")
# async def train_model():

#     global model

#     # lấy toàn bộ dữ liệu từ MongoDB
#     data = list(collection.find())

#     # if len(data) < 10:
#     #     return {"error": "Not enough data to train"}

#     # tạo dataframe
#     sensor_list = []
#     labels = []

#     for d in data:
#         if "sensor_data" in d and "quality_label" in d:
#             sensor_list.append(d["sensor_data"])
#             labels.append(d["quality_label"])

#     df = pd.DataFrame(sensor_list)
#     df["Water Quality"] = labels

#     # tách feature và label
#     X = df.drop("Water Quality", axis=1)
#     y = df["Water Quality"]

#     # train test split
#     X_train, X_test, y_train, y_test = train_test_split(
#         X, y, test_size=0.2, random_state=42
#     )

#     # train model
#     model = RandomForestClassifier()
#     model.fit(X_train, y_train)

#     # đánh giá accuracy
#     predictions = model.predict(X_test)
#     acc = accuracy_score(y_test, predictions)

#     # lưu model
#     joblib.dump(model, MODEL_PATH)

#     return {
#         "message": "Model trained successfully",
#         "dataset_size": len(df),
#         "accuracy": float(acc)
#     }

# =============================
# SOLUTION LOGIC
# =============================
def get_solution(label):

    if label == 0:
        return "Excellent water quality. Maintain current conditions."

    elif label == 1:
        return "Good quality. Monitor DO and Ammonia levels."

    else:
        return "Poor quality detected! Increase aeration, reduce feeding, check Ammonia & Nitrite levels immediately."

# =============================
# INPUT DATA (Giả lập IoT)
# =============================
class WaterInput(BaseModel):

    Temp: float
    Turbidity: float
    DO: float
    BOD: float
    CO2: float
    pH: float
    Alkalinity: float
    Hardness: float
    Calcium: float
    Ammonia: float
    Nitrite: float
    Phosphorus: float
    H2S: float
    Plankton: float

# =============================
# PREDICT
# =============================
@app.post("/predict")
async def predict_quality(data: WaterInput):

    global model

    if model is None:
        return {"error": "Model not trained yet"}

    df = pd.DataFrame([data.dict()])

    df.columns = (
        df.columns
        .str.replace(r"\(.*?\)", "", regex=True)
        .str.replace("-", "")
        .str.strip()
    )

    prediction = model.predict(df)[0]

    result = { 
        "quality_label": int(prediction),
        "quality_name": ["Excellent", "Good", "Poor"][prediction],
        "solution": get_solution(prediction),
        "sensor_data": data.dict()
    }

    # lưu vào database
    insert_result = collection.insert_one(result)

    result["_id"] = str(insert_result.inserted_id)

    return result

# =============================
# HISTORY (dashboard chart)
# =============================
@app.get("/history")
async def get_history():

    data = list(collection.find().sort("_id",-1).limit(50))

    for d in data:
        d["_id"] = str(d["_id"])

    return data