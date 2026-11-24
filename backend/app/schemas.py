"""Pydantic models that document the public API contract."""

from __future__ import annotations

from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

Year = Annotated[int, Field(ge=1980, le=2030, description="Model year of the car")]
EngineCc = Annotated[float, Field(gt=0, le=10_000, description="Engine displacement in cc")]
MileageKmpl = Annotated[float, Field(gt=0, le=100, description="Fuel efficiency in km per litre")]


class CarFeatures(BaseModel):
    """Input accepted by ``POST /predict``."""

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "year": 2018,
            "engine_cc": 1600,
            "mileage_kmpl": 16.5,
            "fuel_type": "Petrol",
            "transmission": "Manual",
            "brand": "Toyota",
        }
    })

    year: Year
    engine_cc: EngineCc
    mileage_kmpl: MileageKmpl
    fuel_type: str = Field(min_length=1, description="e.g. Petrol, Diesel, Electric")
    transmission: str = Field(min_length=1, description="e.g. Manual, Automatic")
    brand: str = Field(min_length=1, description="Manufacturer, e.g. Toyota")


class PredictionInterval(BaseModel):
    """Dispersion band derived from the individual trees of the forest."""

    low: float
    high: float
    method: str = "p10-p90 across trees (dispersion heuristic, not a calibrated CI)"


class PredictionResponse(BaseModel):
    """Output of ``POST /predict``."""

    estimated_price: float = Field(description="Point estimate in USD")
    currency: str = "USD"
    interval: PredictionInterval | None = None
    model: str = "RandomForestRegressor"


class NumericRange(BaseModel):
    min: float
    max: float


class ModelMetadata(BaseModel):
    """Option catalog for the form (populated from the training data)."""

    brands: list[str]
    fuel_types: list[str]
    transmissions: list[str]
    ranges: dict[str, NumericRange] = Field(
        default_factory=dict,
        description="Observed min/max values per numeric field in the training data",
    )
    source: str | None = None


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    version: str
