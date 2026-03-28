from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd 
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "model.pkl")

model = joblib.load(model_path)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CarInput(BaseModel):
    year: int
    engine_cc: float
    mileage_kmpl: float
    fuel_type: str
    transmission: str
    brand: str

@app.get("/")
def read_root():
    return {"message": "API is running"}

@app.post("/predict")
def predict(data: CarInput):
    input_dict = {
        "year": [data.year],
        "engine_cc": [data.engine_cc],
        "mileage_kmpl": [data.mileage_kmpl],
        "fuel_type": [data.fuel_type],
        "transmission": [data.transmission],
        "brand": [data.brand]
    }

    input_df = pd.DataFrame(input_dict)

    prediction = model.predict(input_df)

    return {
        "estimated_price": round(prediction[0], 2)
    }