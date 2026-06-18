from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from ..database import get_db
from ..models.student import Student
from ..models.user import User
from ..schemas.student import StudentCreate, StudentResponse, StudentUpdate
from ..auth import get_current_active_user, admin_only, get_branch_filter

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("/by-index/{student_id}")
def get_student_by_index(
    student_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Look up a student by their index number (student_id) for verification"""
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.post("/", response_model=StudentResponse)
def create_student(
    student: StudentCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)  # Only Admins can invoke this
):
    # Auto-generate Student ID if not provided
    import uuid as uuid_module
    student_data = student.model_dump(exclude_unset=True)
    
    if not student_data.get('student_id'):
        student_data['student_id'] = f"STU-{uuid_module.uuid4().hex[:6].upper()}"
    
    # Assign branch_id from current user if not admin creating for all branches
    branch_id = getattr(current_user, '_token_branch_id', None) or current_user.branch_id
    
    db_student = Student(**student_data, branch_id=branch_id)
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

@router.get("/", response_model=List[StudentResponse])
def read_students(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    branch_filter: Optional[UUID] = Depends(get_branch_filter)
):
    """List students - filtered by branch for non-admin users"""
    query = db.query(Student)
    if branch_filter:
        query = query.filter(Student.branch_id == branch_filter)
    students = query.offset(skip).limit(limit).all()
    return students

@router.get("/by-index/{index_no}", response_model=StudentResponse)
def get_student_by_index(
    index_no: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    branch_filter: Optional[UUID] = Depends(get_branch_filter)
):
    """Lookup a student by their index number (student_id field) for verification"""
    query = db.query(Student).filter(Student.student_id == index_no)
    if branch_filter:
        query = query.filter(Student.branch_id == branch_filter)
    student = query.first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found with this index number")
    return student


@router.get("/{student_id}", response_model=StudentResponse)
def read_student(
    student_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    branch_filter: Optional[UUID] = Depends(get_branch_filter)
):
    query = db.query(Student).filter(Student.id == student_id)
    if branch_filter:
        query = query.filter(Student.branch_id == branch_filter)
    student = query.first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.put("/{student_id}", response_model=StudentResponse)
def update_student(
    student_id: str,
    student_update: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    db_student = db.query(Student).filter(Student.id == student_id).first()
    if db_student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    
    update_data = student_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_student, key, value)
    
    db.commit()
    db.refresh(db_student)
    return db_student

@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(
    student_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    db_student = db.query(Student).filter(Student.id == student_id).first()
    if db_student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    
    db.delete(db_student)
    db.commit()
    return None
