"""Model loading and inference helpers.

The trained artifact is a scikit-learn ``Pipeline`` composed of a
``ColumnTransformer`` (one-hot encoding for categorical columns) and a
``RandomForestRegressor``. Keeping all loading logic here means the HTTP layer
stays free of machine-learning details.
"""

from __future__ import annotations

import json
import os
from functools import lru_cache
from pathlib import Path
from typing import Any

import joblib
import pandas as pd

BACKEND_DIR = Path(__file__).resolve().parents[1]
DEFAULT_MODEL_PATH = BACKEND_DIR / "models" / "model.pkl"
DEFAULT_METADATA_PATH = BACKEND_DIR / "models" / "metadata.json"

# Order matters: it must match the column order used during training.
FEATURE_COLUMNS = [
    "year",
    "engine_cc",
    "mileage_kmpl",
    "fuel_type",
    "transmission",
    "brand",
]

CATEGORICAL_COLUMNS = ["fuel_type", "transmission", "brand"]
NUMERIC_COLUMNS = ["year", "engine_cc", "mileage_kmpl"]


class ModelNotAvailableError(RuntimeError):
    """Raised when the trained model artifact cannot be loaded."""


@lru_cache(maxsize=1)
def get_model() -> Any:
    """Load and cache the trained pipeline."""
    path = Path(os.getenv("MODEL_PATH", DEFAULT_MODEL_PATH))
    if not path.is_file():
        raise ModelNotAvailableError(
            f"Model file not found at '{path}'. "
            "Generate it with `python -m ml.train` from the backend/ directory."
        )
    return joblib.load(path)


@lru_cache(maxsize=1)
def get_metadata() -> dict[str, Any]:
    """Return the option catalog used by the UI.

    The JSON file is written by ``ml/train.py``. If it is missing (for example
    because the model was produced by an older version of the script) the
    categories are recovered from the fitted one-hot encoder instead.
    """
    path = Path(os.getenv("METADATA_PATH", DEFAULT_METADATA_PATH))
    if path.is_file():
        return json.loads(path.read_text(encoding="utf-8"))

    return _metadata_from_model()


def _metadata_from_model() -> dict[str, Any]:
    model = get_model()
    preprocessor = model.named_steps["preprocessor"]
    encoder = preprocessor.named_transformers_["cat"]

    categories = {
        column: [str(value) for value in values]
        for column, values in zip(CATEGORICAL_COLUMNS, encoder.categories_)
    }

    return {
        "brands": categories.get("brand", []),
        "fuel_types": categories.get("fuel_type", []),
        "transmissions": categories.get("transmission", []),
        "ranges": {},
        "source": "inferred from the fitted encoder",
    }


def predict(payload: dict[str, Any]) -> tuple[float, tuple[float, float] | None]:
    """Predict a price and, when possible, a dispersion band.

    The band is the 10th-90th percentile of the individual tree predictions of
    the random forest. It is a dispersion heuristic (how much the trees
    disagree), not a statistically calibrated confidence interval.
    """
    model = get_model()
    frame = pd.DataFrame([{column: payload[column] for column in FEATURE_COLUMNS}])

    price = float(model.predict(frame)[0])

    band: tuple[float, float] | None = None
    regressor = model.named_steps.get("regressor")
    estimators = getattr(regressor, "estimators_", None)
    if estimators:
        preprocessor = model.named_steps["preprocessor"]
        transformed = preprocessor.transform(frame)
        tree_predictions = [float(tree.predict(transformed)[0]) for tree in estimators]
        series = pd.Series(tree_predictions)
        low, high = series.quantile(0.10), series.quantile(0.90)
        band = (float(low), float(high))

    return price, band
