"""
Company Criteria Pydantic Models
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class CompanyCriteria(BaseModel):
    """Company placement eligibility criteria."""
    name: str = Field(..., description="Company name")
    min_cgpa: float = Field(..., ge=0, le=10, description="Minimum CGPA required")
    min_tenth: float = Field(..., ge=0, le=100, description="Minimum 10th percentage")
    min_twelfth: float = Field(..., ge=0, le=100, description="Minimum 12th percentage")
    allowed_departments: List[str] = Field(..., description="List of eligible departments")
    max_backlogs: int = Field(..., ge=0, description="Maximum backlogs allowed")
    min_technical_score: int = Field(..., ge=0, le=100, description="Minimum technical score")
    min_coding_score: int = Field(..., ge=0, le=100, description="Minimum coding score")
    min_communication_score: int = Field(0, ge=0, le=100, description="Minimum communication score")
    min_aptitude_score: int = Field(0, ge=0, le=100, description="Minimum aptitude score")
    package_lpa: float = Field(..., ge=0, description="Package offered in LPA")
    role: str = Field(..., description="Job role title")
    type: Optional[str] = Field(None, description="Company type: Product/Service/Finance/Consulting")


class CompanyListItem(BaseModel):
    """Compact company info for listing."""
    name: str
    package_lpa: float
    role: str
    type: Optional[str] = None
    min_cgpa: float


def format_company_criteria(company: CompanyCriteria) -> str:
    """Format company criteria as a readable string for LLM context."""
    depts = ", ".join(company.allowed_departments)
    return f"""Company: {company.name}
- Role: {company.role}
- Package: {company.package_lpa} LPA
- Type: {company.type or 'N/A'}
- Minimum CGPA: {company.min_cgpa}
- Minimum 10th Percentage: {company.min_tenth}%
- Minimum 12th Percentage: {company.min_twelfth}%
- Allowed Departments: {depts}
- Maximum Backlogs Allowed: {company.max_backlogs}
- Minimum Technical Score: {company.min_technical_score}/100
- Minimum Coding Score: {company.min_coding_score}/100
- Minimum Communication Score: {company.min_communication_score}/100
- Minimum Aptitude Score: {company.min_aptitude_score}/100"""
