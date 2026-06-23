"""
Predict Route — Placement prediction endpoint.
"""

from fastapi import APIRouter, HTTPException
from models.student import StudentProfile
from models.response import PredictionResult
from services.prediction_service import prediction_service
from services.eligibility_service import eligibility_service

router = APIRouter(prefix="/api", tags=["predict"])


@router.post("/predict")
async def predict_placement(profile: StudentProfile):
    """
    Predict placement outcome for a student profile.
    Returns prediction, probability, feature importance, readiness score,
    and strengths/weaknesses analysis.
    """
    try:
        # Run prediction
        result = prediction_service.predict(profile)

        # Calculate readiness score
        readiness_score = eligibility_service.calculate_readiness_score(profile)

        # Get strengths and weaknesses
        analysis = eligibility_service.get_strengths_and_weaknesses(profile)

        return {
            "prediction": result["prediction"],
            "probability": result["probability"],
            "feature_importance": result.get("feature_importance", {}),
            "readiness_score": readiness_score,
            "strengths": analysis["strengths"],
            "weaknesses": analysis["weaknesses"],
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
