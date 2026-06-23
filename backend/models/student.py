"""
Student Profile Pydantic Models
"""

from pydantic import BaseModel, Field
from typing import Optional


class StudentProfile(BaseModel):
    """Complete student profile for placement evaluation."""
    name: str = Field(..., description="Student's full name")
    cgpa: float = Field(..., ge=0, le=10, description="Cumulative GPA (0-10 scale)")
    tenth_percentage: float = Field(..., ge=0, le=100, description="10th grade percentage")
    twelfth_percentage: float = Field(..., ge=0, le=100, description="12th grade percentage")
    department: str = Field(..., description="Engineering department/branch")
    aptitude_score: int = Field(..., ge=0, le=100, description="Aptitude test score")
    communication_score: int = Field(..., ge=0, le=100, description="Communication skill score")
    technical_score: int = Field(..., ge=0, le=100, description="Technical knowledge score")
    coding_score: int = Field(..., ge=0, le=100, description="Coding/programming score")
    projects_completed: int = Field(..., ge=0, description="Number of projects completed")
    internships: int = Field(..., ge=0, description="Number of internships completed")
    certifications: int = Field(..., ge=0, description="Number of certifications earned")
    attendance: float = Field(..., ge=0, le=100, description="Attendance percentage")
    backlogs: int = Field(..., ge=0, description="Number of active backlogs")


class StudentProfileOptional(BaseModel):
    """Optional student profile for partial updates."""
    name: Optional[str] = None
    cgpa: Optional[float] = Field(None, ge=0, le=10)
    tenth_percentage: Optional[float] = Field(None, ge=0, le=100)
    twelfth_percentage: Optional[float] = Field(None, ge=0, le=100)
    department: Optional[str] = None
    aptitude_score: Optional[int] = Field(None, ge=0, le=100)
    communication_score: Optional[int] = Field(None, ge=0, le=100)
    technical_score: Optional[int] = Field(None, ge=0, le=100)
    coding_score: Optional[int] = Field(None, ge=0, le=100)
    projects_completed: Optional[int] = Field(None, ge=0)
    internships: Optional[int] = Field(None, ge=0)
    certifications: Optional[int] = Field(None, ge=0)
    attendance: Optional[float] = Field(None, ge=0, le=100)
    backlogs: Optional[int] = Field(None, ge=0)


def format_student_profile(profile: StudentProfile) -> str:
    """Format student profile as a readable string for LLM context."""
    return f"""Student Profile:
- Name: {profile.name}
- CGPA: {profile.cgpa}/10
- 10th Percentage: {profile.tenth_percentage}%
- 12th Percentage: {profile.twelfth_percentage}%
- Department: {profile.department}
- Aptitude Score: {profile.aptitude_score}/100
- Communication Score: {profile.communication_score}/100
- Technical Score: {profile.technical_score}/100
- Coding Score: {profile.coding_score}/100
- Projects Completed: {profile.projects_completed}
- Internships: {profile.internships}
- Certifications: {profile.certifications}
- Attendance: {profile.attendance}%
- Active Backlogs: {profile.backlogs}"""
