"""
Eligibility Service — Company eligibility assessment and readiness scoring.
Compares student profiles against company criteria for detailed evaluation.
"""

import logging
from typing import List, Dict, Optional
import pandas as pd

from models.student import StudentProfile
from models.company import CompanyCriteria, CompanyListItem

logger = logging.getLogger(__name__)


class EligibilityService:
    """Company eligibility checker and placement readiness scorer."""

    def __init__(self):
        self.companies: Dict[str, CompanyCriteria] = {}
        self.is_loaded = False

    def load_companies(self, csv_path: str) -> bool:
        """Load company criteria from CSV file."""
        try:
            df = pd.read_csv(csv_path)
            self.companies = {}

            for _, row in df.iterrows():
                # Parse allowed departments (comma-separated string)
                departments = [d.strip() for d in str(row["allowed_departments"]).split(",")]

                company = CompanyCriteria(
                    name=row["name"],
                    min_cgpa=float(row["min_cgpa"]),
                    min_tenth=float(row["min_tenth"]),
                    min_twelfth=float(row["min_twelfth"]),
                    allowed_departments=departments,
                    max_backlogs=int(row["max_backlogs"]),
                    min_technical_score=int(row["min_technical_score"]),
                    min_coding_score=int(row["min_coding_score"]),
                    min_communication_score=int(row.get("min_communication_score", 0)),
                    min_aptitude_score=int(row.get("min_aptitude_score", 0)),
                    package_lpa=float(row["package_lpa"]),
                    role=str(row["role"]),
                    type=str(row.get("type", "")),
                )
                self.companies[company.name.lower()] = company

            self.is_loaded = True
            logger.info(f"Loaded {len(self.companies)} company profiles")
            return True

        except Exception as e:
            logger.error(f"Error loading companies: {e}")
            return False

    def get_company(self, name: str) -> Optional[CompanyCriteria]:
        """Get company criteria by name (case-insensitive)."""
        return self.companies.get(name.lower())

    def list_companies(self) -> List[CompanyListItem]:
        """List all available companies."""
        return [
            CompanyListItem(
                name=c.name,
                package_lpa=c.package_lpa,
                role=c.role,
                type=c.type,
                min_cgpa=c.min_cgpa,
            )
            for c in self.companies.values()
        ]

    def check_eligibility(self, profile: StudentProfile, company_name: str) -> Dict:
        """
        Check student eligibility against a specific company's criteria.
        Returns detailed comparison with met/unmet criteria and readiness score.
        """
        company = self.get_company(company_name)
        if not company:
            return {
                "company_name": company_name,
                "status": "Unknown",
                "error": f"Company '{company_name}' not found in database.",
                "criteria_met": [],
                "criteria_not_met": [],
                "total_criteria": 0,
                "criteria_passed": 0,
                "readiness_score": 0,
            }

        criteria_met = []
        criteria_not_met = []

        # Check each criterion
        checks = [
            {
                "criterion": "CGPA",
                "required": f">= {company.min_cgpa}",
                "student_value": str(profile.cgpa),
                "met": profile.cgpa >= company.min_cgpa,
            },
            {
                "criterion": "10th Percentage",
                "required": f">= {company.min_tenth}%",
                "student_value": f"{profile.tenth_percentage}%",
                "met": profile.tenth_percentage >= company.min_tenth,
            },
            {
                "criterion": "12th Percentage",
                "required": f">= {company.min_twelfth}%",
                "student_value": f"{profile.twelfth_percentage}%",
                "met": profile.twelfth_percentage >= company.min_twelfth,
            },
            {
                "criterion": "Department",
                "required": ", ".join(company.allowed_departments),
                "student_value": profile.department,
                "met": profile.department in company.allowed_departments,
            },
            {
                "criterion": "Active Backlogs",
                "required": f"<= {company.max_backlogs}",
                "student_value": str(profile.backlogs),
                "met": profile.backlogs <= company.max_backlogs,
            },
            {
                "criterion": "Technical Score",
                "required": f">= {company.min_technical_score}",
                "student_value": str(profile.technical_score),
                "met": profile.technical_score >= company.min_technical_score,
            },
            {
                "criterion": "Coding Score",
                "required": f">= {company.min_coding_score}",
                "student_value": str(profile.coding_score),
                "met": profile.coding_score >= company.min_coding_score,
            },
        ]

        # Add optional criteria if company has them
        if company.min_communication_score > 0:
            checks.append({
                "criterion": "Communication Score",
                "required": f">= {company.min_communication_score}",
                "student_value": str(profile.communication_score),
                "met": profile.communication_score >= company.min_communication_score,
            })

        if company.min_aptitude_score > 0:
            checks.append({
                "criterion": "Aptitude Score",
                "required": f">= {company.min_aptitude_score}",
                "student_value": str(profile.aptitude_score),
                "met": profile.aptitude_score >= company.min_aptitude_score,
            })

        # Categorize results
        for check in checks:
            if check["met"]:
                criteria_met.append(check)
            else:
                criteria_not_met.append(check)

        total = len(checks)
        passed = len(criteria_met)

        # Determine status
        if passed == total:
            status = "Eligible"
        elif passed >= total * 0.7:
            status = "Partially Eligible"
        else:
            status = "Not Eligible"

        # Calculate readiness score
        readiness_score = self.calculate_readiness_score(profile)

        return {
            "company_name": company.name,
            "status": status,
            "criteria_met": criteria_met,
            "criteria_not_met": criteria_not_met,
            "total_criteria": total,
            "criteria_passed": passed,
            "readiness_score": readiness_score,
            "package_lpa": company.package_lpa,
            "role": company.role,
        }

    def calculate_readiness_score(self, profile: StudentProfile) -> int:
        """
        Calculate a Placement Readiness Score between 0 and 100.
        Weights based on industry importance of each factor.
        """
        score = 0.0

        # CGPA (20 points max)
        score += min((profile.cgpa / 10) * 20, 20)

        # Academic history (10 points max)
        score += min((profile.tenth_percentage / 100) * 5, 5)
        score += min((profile.twelfth_percentage / 100) * 5, 5)

        # Technical skills (15 points max)
        score += min((profile.technical_score / 100) * 15, 15)

        # Coding ability (15 points max)
        score += min((profile.coding_score / 100) * 15, 15)

        # Communication (10 points max)
        score += min((profile.communication_score / 100) * 10, 10)

        # Aptitude (8 points max)
        score += min((profile.aptitude_score / 100) * 8, 8)

        # Projects (7 points max)
        score += min((profile.projects_completed / 6) * 7, 7)

        # Internships (7 points max)
        score += min((profile.internships / 3) * 7, 7)

        # Certifications (4 points max)
        score += min((profile.certifications / 4) * 4, 4)

        # Attendance (4 points max)
        score += min((profile.attendance / 100) * 4, 4)

        # Backlog penalty (up to -15 points)
        backlog_penalty = min(profile.backlogs * 5, 15)
        score -= backlog_penalty

        return max(0, min(int(round(score)), 100))

    def get_strengths_and_weaknesses(self, profile: StudentProfile) -> Dict:
        """Analyze student profile for strengths and areas for improvement."""
        strengths = []
        weaknesses = []

        # CGPA
        if profile.cgpa >= 8.0:
            strengths.append(f"Strong academic performance (CGPA: {profile.cgpa})")
        elif profile.cgpa < 6.5:
            weaknesses.append(f"Low CGPA ({profile.cgpa}) — limits eligibility for many companies")

        # Technical Score
        if profile.technical_score >= 80:
            strengths.append(f"Excellent technical skills (Score: {profile.technical_score})")
        elif profile.technical_score < 60:
            weaknesses.append(f"Technical skills need improvement (Score: {profile.technical_score})")

        # Coding Score
        if profile.coding_score >= 80:
            strengths.append(f"Strong coding ability (Score: {profile.coding_score})")
        elif profile.coding_score < 60:
            weaknesses.append(f"Coding skills require practice (Score: {profile.coding_score})")

        # Communication
        if profile.communication_score >= 75:
            strengths.append(f"Good communication skills (Score: {profile.communication_score})")
        elif profile.communication_score < 55:
            weaknesses.append(f"Communication skills need work (Score: {profile.communication_score})")

        # Aptitude
        if profile.aptitude_score >= 75:
            strengths.append(f"Strong aptitude (Score: {profile.aptitude_score})")
        elif profile.aptitude_score < 55:
            weaknesses.append(f"Aptitude preparation needed (Score: {profile.aptitude_score})")

        # Projects
        if profile.projects_completed >= 5:
            strengths.append(f"Rich project experience ({profile.projects_completed} projects)")
        elif profile.projects_completed < 3:
            weaknesses.append(f"Limited project experience ({profile.projects_completed} projects)")

        # Internships
        if profile.internships >= 2:
            strengths.append(f"Valuable internship experience ({profile.internships} internships)")
        elif profile.internships == 0:
            weaknesses.append("No internship experience — significant disadvantage")

        # Certifications
        if profile.certifications >= 3:
            strengths.append(f"Multiple certifications ({profile.certifications})")
        elif profile.certifications == 0:
            weaknesses.append("No certifications — consider obtaining relevant ones")

        # Attendance
        if profile.attendance >= 90:
            strengths.append(f"Excellent attendance ({profile.attendance}%)")
        elif profile.attendance < 75:
            weaknesses.append(f"Low attendance ({profile.attendance}%) — professionalism concern")

        # Backlogs
        if profile.backlogs == 0:
            strengths.append("No active backlogs")
        else:
            weaknesses.append(f"{profile.backlogs} active backlog(s) — reduces eligibility significantly")

        return {
            "strengths": strengths,
            "weaknesses": weaknesses,
        }


# Global singleton
eligibility_service = EligibilityService()
