from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from ..database import get_db
from ..models.attendance import Attendance
from ..models.user import User
from ..schemas.attendance import AttendanceCreate, AttendanceResponse, AttendanceUpdate
from ..auth import get_current_active_user, admin_only

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.post("/", response_model=AttendanceResponse)
def create_attendance(
    attendance: AttendanceCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)  # Teachers can mark
):
    db_attendance = Attendance(**attendance.dict())
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

@router.get("/", response_model=List[AttendanceResponse])
def read_all_attendance(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    records = db.query(Attendance).offset(skip).limit(limit).all()
    return records

@router.get("/student/{student_id}", response_model=List[AttendanceResponse])
def read_attendance_by_student(
    student_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    records = db.query(Attendance).filter(Attendance.student_id == student_id).all()
    return records

@router.get("/date/{target_date}", response_model=List[AttendanceResponse])
def read_attendance_by_date(
    target_date: date, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    records = db.query(Attendance).filter(Attendance.date == target_date).all()
    return records

@router.put("/{attendance_id}", response_model=AttendanceResponse)
def update_attendance(
    attendance_id: str,
    attendance_update: AttendanceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_record = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if db_record is None:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    
    update_data = attendance_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_record, key, value)
    
    db.commit()
    db.refresh(db_record)
    return db_record

@router.delete("/{attendance_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attendance(
    attendance_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    db_record = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if db_record is None:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    
    db.delete(db_record)
    db.commit()
    return None
