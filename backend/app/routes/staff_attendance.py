from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from uuid import UUID
from ..database import get_db
from ..models.staff_attendance import StaffAttendance
from ..models.user import User
from ..schemas.staff_attendance import StaffAttendanceCreate, StaffAttendanceResponse, StaffAttendanceUpdate
from ..auth import get_current_active_user, admin_only, get_branch_filter

router = APIRouter(prefix="/staff-attendance", tags=["Staff Attendance"])


@router.post("/", response_model=StaffAttendanceResponse)
def create_staff_attendance(
    attendance: StaffAttendanceCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)  # Only admin can mark staff attendance
):
    # Assign branch_id from current user
    branch_id = getattr(current_user, '_token_branch_id', None) or current_user.branch_id
    
    db_attendance = StaffAttendance(**attendance.model_dump(), branch_id=branch_id)
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance


@router.get("/", response_model=List[StaffAttendanceResponse])
def read_all_staff_attendance(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    branch_filter: Optional[UUID] = Depends(get_branch_filter)
):
    """List staff attendance records - filtered by branch for non-admin users"""
    query = db.query(StaffAttendance)
    if branch_filter:
        query = query.filter(StaffAttendance.branch_id == branch_filter)
    records = query.offset(skip).limit(limit).all()
    return records


@router.get("/staff/{staff_id}", response_model=List[StaffAttendanceResponse])
def read_attendance_by_staff(
    staff_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    branch_filter: Optional[UUID] = Depends(get_branch_filter)
):
    """Get attendance records for a specific staff member"""
    query = db.query(StaffAttendance).filter(StaffAttendance.staff_id == staff_id)
    if branch_filter:
        query = query.filter(StaffAttendance.branch_id == branch_filter)
    records = query.all()
    return records


@router.get("/date/{target_date}", response_model=List[StaffAttendanceResponse])
def read_staff_attendance_by_date(
    target_date: date, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    branch_filter: Optional[UUID] = Depends(get_branch_filter)
):
    """Get all staff attendance records for a specific date"""
    query = db.query(StaffAttendance).filter(StaffAttendance.date == target_date)
    if branch_filter:
        query = query.filter(StaffAttendance.branch_id == branch_filter)
    records = query.all()
    return records


@router.get("/{attendance_id}", response_model=StaffAttendanceResponse)
def read_staff_attendance(
    attendance_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    branch_filter: Optional[UUID] = Depends(get_branch_filter)
):
    """Get a specific staff attendance record"""
    query = db.query(StaffAttendance).filter(StaffAttendance.id == attendance_id)
    if branch_filter:
        query = query.filter(StaffAttendance.branch_id == branch_filter)
    record = query.first()
    if record is None:
        raise HTTPException(status_code=404, detail="Staff attendance record not found")
    return record


@router.put("/{attendance_id}", response_model=StaffAttendanceResponse)
def update_staff_attendance(
    attendance_id: str,
    attendance_update: StaffAttendanceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    """Update a staff attendance record (admin only)"""
    db_record = db.query(StaffAttendance).filter(StaffAttendance.id == attendance_id).first()
    if db_record is None:
        raise HTTPException(status_code=404, detail="Staff attendance record not found")
    
    update_data = attendance_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_record, key, value)
    
    db.commit()
    db.refresh(db_record)
    return db_record


@router.delete("/{attendance_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_staff_attendance(
    attendance_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    """Delete a staff attendance record (admin only)"""
    db_record = db.query(StaffAttendance).filter(StaffAttendance.id == attendance_id).first()
    if db_record is None:
        raise HTTPException(status_code=404, detail="Staff attendance record not found")
    
    db.delete(db_record)
    db.commit()
    return None
