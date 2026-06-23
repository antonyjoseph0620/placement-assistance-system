"""
Students Route — Student data CRUD endpoints.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import pandas as pd
from pathlib import Path

from models.student import StudentProfile
from config import STUDENTS_CSV

router = APIRouter(prefix="/api", tags=["students"])


@router.get("/students")
async def list_students(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    department: Optional[str] = Query(None, description="Filter by department"),
):
    """List students with pagination and optional filtering."""
    try:
        if not Path(STUDENTS_CSV).exists():
            return {"students": [], "total": 0, "page": page, "per_page": per_page}

        df = pd.read_csv(STUDENTS_CSV)

        # Filter by department if specified
        if department:
            df = df[df["department"].str.lower() == department.lower()]

        total = len(df)

        # Paginate
        start = (page - 1) * per_page
        end = start + per_page
        page_data = df.iloc[start:end]

        students = page_data.to_dict(orient="records")

        return {
            "students": students,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": (total + per_page - 1) // per_page,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching students: {str(e)}")


@router.get("/students/{student_name}")
async def get_student(student_name: str):
    """Get a specific student by name."""
    try:
        if not Path(STUDENTS_CSV).exists():
            raise HTTPException(status_code=404, detail="Student data not found")

        df = pd.read_csv(STUDENTS_CSV)
        student_row = df[df["name"].str.lower() == student_name.lower()]

        if student_row.empty:
            raise HTTPException(status_code=404, detail=f"Student '{student_name}' not found")

        return student_row.iloc[0].to_dict()

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.post("/students")
async def add_student(profile: StudentProfile):
    """Add a new student record to the database."""
    try:
        csv_path = Path(STUDENTS_CSV)

        # Create new row
        new_row = {
            "name": profile.name,
            "cgpa": profile.cgpa,
            "tenth_percentage": profile.tenth_percentage,
            "twelfth_percentage": profile.twelfth_percentage,
            "department": profile.department,
            "aptitude_score": profile.aptitude_score,
            "communication_score": profile.communication_score,
            "technical_score": profile.technical_score,
            "coding_score": profile.coding_score,
            "projects_completed": profile.projects_completed,
            "internships": profile.internships,
            "certifications": profile.certifications,
            "attendance": profile.attendance,
            "backlogs": profile.backlogs,
            "placed": 0,  # Default to not placed
        }

        if csv_path.exists():
            df = pd.read_csv(csv_path)
            df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
        else:
            df = pd.DataFrame([new_row])

        df.to_csv(csv_path, index=False)

        return {"message": f"Student '{profile.name}' added successfully", "student": new_row}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding student: {str(e)}")


@router.get("/stats")
async def get_stats():
    """Get placement statistics."""
    try:
        if not Path(STUDENTS_CSV).exists():
            return {"total_students": 0, "placed": 0, "not_placed": 0, "placement_rate": 0}

        df = pd.read_csv(STUDENTS_CSV)
        total = len(df)
        placed = int(df["placed"].sum())
        not_placed = total - placed

        # Department-wise stats
        dept_stats = df.groupby("department").agg(
            total=("name", "count"),
            placed=("placed", "sum"),
            avg_cgpa=("cgpa", "mean"),
        ).to_dict(orient="index")

        return {
            "total_students": total,
            "placed": placed,
            "not_placed": not_placed,
            "placement_rate": round(placed / total * 100, 1) if total > 0 else 0,
            "avg_cgpa": round(float(df["cgpa"].mean()), 2),
            "department_stats": dept_stats,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
