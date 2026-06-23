"""
Eligibility Route — Company eligibility checking endpoints.
"""

from fastapi import APIRouter, HTTPException
from typing import Optional
from models.student import StudentProfile
from models.response import EligibilityResult, EligibilityCriterion, EligibilityRequest
from services.eligibility_service import eligibility_service

router = APIRouter(prefix="/api", tags=["eligibility"])


@router.post("/eligibility")
async def check_eligibility(request: EligibilityRequest):
    """
    Check student eligibility against a specific company.
    Returns detailed criterion comparison and readiness score.
    """
    try:
        result = eligibility_service.check_eligibility(request.profile, request.company_name)

        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])

        return {
            "company_name": result["company_name"],
            "status": result["status"],
            "criteria_met": result["criteria_met"],
            "criteria_not_met": result["criteria_not_met"],
            "total_criteria": result["total_criteria"],
            "criteria_passed": result["criteria_passed"],
            "readiness_score": result["readiness_score"],
            "package_lpa": result.get("package_lpa"),
            "role": result.get("role"),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Eligibility error: {str(e)}")


@router.get("/companies")
async def list_companies():
    """List all available companies with basic info."""
    companies = eligibility_service.list_companies()
    return {
        "companies": [c.model_dump() for c in companies],
        "total": len(companies),
    }


@router.get("/companies/{company_name}")
async def get_company(company_name: str):
    """Get detailed criteria for a specific company."""
    company = eligibility_service.get_company(company_name)
    if not company:
        raise HTTPException(status_code=404, detail=f"Company '{company_name}' not found")
    return company.model_dump()
