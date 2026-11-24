"""FastAPI application that serves the used-car price prediction model.

Run it from the ``backend`` directory:

    uvicorn app.main:app --reload
"""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.model import ModelNotAvailableError, get_metadata, get_model, predict
from app.schemas import (
    CarFeatures,
    HealthResponse,
    ModelMetadata,
    PredictionInterval,
    PredictionResponse,
)

logger = logging.getLogger("car-price-api")

DESCRIPTION = """
REST API that estimates the market price of a used car with a scikit-learn
pipeline (one-hot encoding + random forest regressor).

* `GET /metadata` returns the option catalog used by the form.
* `POST /predict` returns the estimated price and a dispersion band.
"""


def _allowed_origins() -> list[str]:
    raw = os.getenv("ALLOWED_ORIGINS", "*")
    origins = [origin.strip() for origin in raw.split(",") if origin.strip()]
    return origins or ["*"]


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Load the model once at startup so the first request is not slow."""
    try:
        get_model()
        logger.info("Model loaded successfully")
    except Exception as exc:  # noqa: BLE001 - the API must still start
        logger.warning("Model is not available yet: %s", exc)
    yield


app = FastAPI(
    title="Car Price Predictor API",
    description=DESCRIPTION,
    version=__version__,
    license_info={"name": "MIT"},
    lifespan=lifespan,
)

_origins = _allowed_origins()
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    # The wildcard origin is incompatible with credentialed requests.
    allow_credentials=_origins != ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["service"], summary="Service card")
def read_root() -> dict[str, str]:
    return {
        "service": "car-price-predictor-api",
        "version": __version__,
        "docs": "/docs",
    }


@app.get("/health", tags=["service"], summary="Liveness probe", response_model=HealthResponse)
def health() -> HealthResponse:
    try:
        get_model()
        model_loaded = True
    except ModelNotAvailableError:
        model_loaded = False
    return HealthResponse(
        status="ok" if model_loaded else "degraded",
        model_loaded=model_loaded,
        version=__version__,
    )


@app.get("/metadata", tags=["model"], summary="Form options", response_model=ModelMetadata)
def metadata() -> ModelMetadata:
    try:
        return ModelMetadata(**get_metadata())
    except ModelNotAvailableError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc


@app.post(
    "/predict",
    tags=["model"],
    summary="Estimate a used-car price",
    response_model=PredictionResponse,
)
def estimate_price(car: CarFeatures) -> PredictionResponse:
    try:
        options = get_metadata()
        _ensure_known_options(car, options)
        price, band = predict(car.model_dump())
    except ModelNotAvailableError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc

    interval = (
        PredictionInterval(low=round(band[0], 2), high=round(band[1], 2))
        if band is not None
        else None
    )

    return PredictionResponse(
        estimated_price=round(price, 2),
        interval=interval,
    )


def _ensure_known_options(car: CarFeatures, options: dict) -> None:
    """Reject values the encoder has never seen instead of silently ignoring them."""
    checks = (
        ("brand", "brands", car.brand),
        ("fuel_type", "fuel_types", car.fuel_type),
        ("transmission", "transmissions", car.transmission),
    )
    for field, key, value in checks:
        allowed = options.get(key) or []
        if allowed and value not in allowed:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Unknown {field} '{value}'. Allowed values: {', '.join(allowed)}",
            )
