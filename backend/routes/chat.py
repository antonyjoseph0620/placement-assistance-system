"""
Chat Route — Main AI chat endpoint.
Orchestrates prediction, eligibility, and RAG for comprehensive responses.
"""

from fastapi import APIRouter, HTTPException
from models.response import ChatRequest, ChatResponse, PredictionResult, EligibilityResult, EligibilityCriterion
from models.student import StudentProfile, format_student_profile
from models.company import format_company_criteria
from services.prediction_service import prediction_service
from services.eligibility_service import eligibility_service
from services.rag_service import rag_service

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint — accepts a question and optional student profile/company.
    Orchestrates ML prediction, eligibility check, and RAG query.
    """
    try:
        prediction = None
        eligibility = None
        readiness_score = None
        student_profile_str = "Not provided"
        prediction_result_str = "Not available"

        # If student profile is provided, run analysis
        if request.student_profile:
            try:
                profile = StudentProfile(**request.student_profile)
                student_profile_str = format_student_profile(profile)

                # Run placement prediction
                pred_result = prediction_service.predict(profile)
                prediction = PredictionResult(
                    prediction=pred_result["prediction"],
                    probability=pred_result["probability"],
                    feature_importance=pred_result.get("feature_importance"),
                )
                prediction_result_str = prediction_service.format_prediction_result(pred_result)

                # Calculate readiness score
                readiness_score = eligibility_service.calculate_readiness_score(profile)

                # Check company eligibility if company name provided
                if request.company_name:
                    elig_result = eligibility_service.check_eligibility(profile, request.company_name)

                    if "error" not in elig_result:
                        eligibility = EligibilityResult(
                            company_name=elig_result["company_name"],
                            status=elig_result["status"],
                            criteria_met=[
                                EligibilityCriterion(**c) for c in elig_result["criteria_met"]
                            ],
                            criteria_not_met=[
                                EligibilityCriterion(**c) for c in elig_result["criteria_not_met"]
                            ],
                            total_criteria=elig_result["total_criteria"],
                            criteria_passed=elig_result["criteria_passed"],
                            readiness_score=elig_result["readiness_score"],
                        )

                        # Add company criteria to prediction context
                        company = eligibility_service.get_company(request.company_name)
                        if company:
                            prediction_result_str += f"\n\n{format_company_criteria(company)}"
                            prediction_result_str += f"\n\nEligibility Status: {elig_result['status']}"

            except Exception as e:
                student_profile_str = f"Error parsing profile: {str(e)}"

        # Query RAG for AI response
        rag_result = rag_service.query(
            question=request.question,
            student_profile=student_profile_str,
            prediction_result=prediction_result_str,
        )

        return ChatResponse(
            response=rag_result["response"],
            prediction=prediction,
            eligibility=eligibility,
            readiness_score=readiness_score,
            sources_used=rag_result["sources_used"],
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")
