"""
API Response Pydantic Models
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from models.student import StudentProfile


class PredictionResult(BaseModel):
    """Placement prediction result from the ML model."""
    prediction: str = Field(..., description="'Placed' or 'Not Placed'")
    probability: float = Field(..., ge=0, le=1, description="Placement probability (0-1)")
    feature_importance: Optional[Dict[str, float]] = Field(
        None, description="Feature importance scores"
    )


class EligibilityCriterion(BaseModel):
    """Single eligibility criterion comparison."""
    criterion: str
    required: str
    student_value: str
    met: bool


class EligibilityResult(BaseModel):
    """Company eligibility assessment result."""
    company_name: str
    status: str = Field(..., description="'Eligible', 'Partially Eligible', or 'Not Eligible'")
    criteria_met: List[EligibilityCriterion]
    criteria_not_met: List[EligibilityCriterion]
    total_criteria: int
    criteria_passed: int
    readiness_score: int = Field(..., ge=0, le=100)


class ChatRequest(BaseModel):
    """Chat endpoint request body."""
    question: str = Field(..., min_length=1, description="User's question")
    student_profile: Optional[Dict[str, Any]] = Field(
        None, description="Student profile data"
    )
    company_name: Optional[str] = Field(
        None, description="Company name for eligibility check"
    )


class ChatResponse(BaseModel):
    """Chat endpoint response."""
    response: str = Field(..., description="AI-generated guidance response")
    prediction: Optional[PredictionResult] = None
    eligibility: Optional[EligibilityResult] = None
    readiness_score: Optional[int] = Field(None, ge=0, le=100)
    sources_used: int = Field(0, description="Number of RAG sources used")


class EligibilityRequest(BaseModel):
    """Eligibility endpoint request payload."""
    profile: StudentProfile
    company_name: str = Field(..., description="Company name for eligibility check")


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    model_loaded: bool
    llm_error: Optional[str] = None
    vectorstore_ready: bool
    students_count: int
    companies_count: int

