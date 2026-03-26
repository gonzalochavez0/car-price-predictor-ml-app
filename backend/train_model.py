import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib

# cargar dataset
df = pd.read_csv("carsUsed.csv")


df = df.rename(columns={
    "make_year": "year",
    "price_usd": "price"
})

df = df[[
    "year",
    "engine_cc",
    "mileage_kmpl",
    "fuel_type",
    "transmission",
    "brand",
    "price"
]]

# limpiar
df = df.dropna()

# features
X = df.drop("price", axis=1)
y = df["price"]

# columnas
numeric_features = ["year", "engine_cc", "mileage_kmpl"]
categorical_features = ["fuel_type", "transmission", "brand"]

# transformaciones
preprocessor = ColumnTransformer(
    transformers=[
        ("num", "passthrough", numeric_features),
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features),
    ]
)

model = Pipeline(steps=[
    ("preprocessor", preprocessor),
    ("regressor", RandomForestRegressor(n_estimators=100, random_state=42))
])

# split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# entrenar
model.fit(X_train, y_train)

# evaluar
predictions = model.predict(X_test)
mae = mean_absolute_error(y_test, predictions)

print(f"MAE (test): {mae}")

# guardar
joblib.dump(model, "model.pkl")

print("Modelo entrenado con pipeline completo")