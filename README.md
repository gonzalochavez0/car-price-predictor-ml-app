# 🚗 Car Price Predictor ML App

A full-stack web application that predicts used car prices using a machine learning model.

---

## 🌐 Overview

This project allows users to estimate the price of a used vehicle based on its characteristics.

It combines:

- 🧠 Machine Learning (price prediction)
- ⚡ FastAPI backend
- 🎨 Modern frontend (Astro + React + Tailwind)

---

## ✨ Features

- Predict car prices based on:
  - Year
  - Engine size
  - Fuel type
  - Transmission
  - Brand
- Real-time predictions via API
- Clean and responsive UI
- Dynamic result panel with structured data
- Input validation and user-friendly UX

---

## 🛠️ Tech Stack

### Frontend
- Astro
- React
- Tailwind CSS

### Backend
- FastAPI
- Python

### Machine Learning
- Scikit-learn
- Random Forest Regressor
- OneHotEncoder (categorical features)

---

## 🧠 Machine Learning Details

- Model: `RandomForestRegressor`
- Features:
  - Numerical: year, engine_cc, mileage_kmpl
  - Categorical: fuel_type, transmission, brand
- Preprocessing:
  - `ColumnTransformer`
  - `OneHotEncoder(handle_unknown="ignore")`
- Evaluation:
  - Mean Absolute Error (MAE)

---

## 📁 Project Structure
```
car-price-predictor-ml-app/
│
├── backend/
│ ├── main.py
│ ├── train_model.py
│ ├── model.pkl
│ ├── cars.csv
│ ├── requirements.txt
│
├── frontend/
│ ├── src/
│ ├── public/
│ ├── package.json
│
├── README.md
├── LICENSE
```

---

## 📸 Screenshots

### 🧾 Input Form
![Form](./frontend/public/cap1.png)

### 📊 Prediction Result
![Result](./frontend/public/cap2.png)

---

## 🚀 How to Run Locally

### 🔹 Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
### 🔹 Frontend

```bash
cd frontend
npm install
npm run dev
```
## ⚠️ Notes
- This project uses a locally trained machine learning model
- No API keys or sensitive data are required
- Designed as a portfolio project to demonstrate full-stack + ML integration

## 🔮 Future Improvements
- PDF report generation
- Deployment (Vercel + Render)
- Improved model accuracy with larger dataset
- More advanced feature engineering

## 👨‍💻 Author

**Gonzalo Chavez**
