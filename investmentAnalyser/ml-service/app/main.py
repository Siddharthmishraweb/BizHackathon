"""FastAPI application for the trained financial risk-profile model."""

from contextlib import asynccontextmanager
from pathlib import Path

import joblib
from fastapi import FastAPI, HTTPException, Request

from app.preprocessing.features import build_feature_frame
from app.schemas.risk import RiskPredictionRequest, RiskPredictionResponse


MODEL_PATH = Path(__file__).resolve().parent / "models" / "risk_profile_model.joblib"


@asynccontextmanager
async def lifespan(application: FastAPI):
    if not MODEL_PATH.is_file():
        raise RuntimeError(f"Trained model was not found at {MODEL_PATH}")
    artifact = joblib.load(MODEL_PATH)
    application.state.model = artifact["model"]
    application.state.feature_columns = artifact["feature_columns"]
    application.state.risk_labels = artifact["risk_labels"]
    application.state.model_version = artifact["model_version"]
    yield


app = FastAPI(
    title="Investment Analyser ML Service",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/health")
def health(request: Request) -> dict[str, str]:
    return {"status": "ok", "model_version": request.app.state.model_version}


@app.post("/predict-risk", response_model=RiskPredictionResponse)
def predict_risk(request_body: RiskPredictionRequest, request: Request) -> RiskPredictionResponse:
    try:
        features = build_feature_frame(request_body, request.app.state.feature_columns)
        predicted_profile = request.app.state.model.predict(features)[0]
        probability_values = request.app.state.model.predict_proba(features)[0]
    except Exception as error:
        raise HTTPException(status_code=500, detail="Risk prediction could not be completed") from error

    probabilities = {
        label: round(float(probability), 6)
        for label, probability in zip(request.app.state.model.classes_, probability_values)
    }
    return RiskPredictionResponse(
        risk_profile=predicted_profile,
        probabilities=probabilities,
    )