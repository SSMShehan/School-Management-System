from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from ..database import get_db
from ..models.staff import Staff
from ..models.user import User
from ..schemas.staff import StaffCreate, StaffResponse, StaffUpdate
from ..auth import get_current_active_user, admin_only, get_branch_filter

router = APIRouter(prefix="/staff", tags=["Staff"])

@router.post("/", response_model=StaffResponse)
def create_staff(
    staff: StaffCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    # Assign branch_id from current user if not specified
    branch_id = getattr(current_user, '_token_branch_id', None) or current_user.branch_id
    
    db_staff = Staff(**staff.model_dump(), branch_id=branch_id)
    db.add(db_staff)
    db.commit()
    db.refresh(db_staff)
    return db_staff

@router.get("/", response_model=List[StaffResponse])
def read_all_staff(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    branch_filter: Optional[UUID] = Depends(get_branch_filter)
):
    """List staff - filtered by branch for non-admin users"""
    query = db.query(Staff)
    if branch_filter:
        query = query.filter(Staff.branch_id == branch_filter)
    staff_list = query.offset(skip).limit(limit).all()
    return staff_list

@router.get("/{staff_id}", response_model=StaffResponse)
def read_staff(
    staff_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    branch_filter: Optional[UUID] = Depends(get_branch_filter)
):
    query = db.query(Staff).filter(Staff.id == staff_id)
    if branch_filter:
        query = query.filter(Staff.branch_id == branch_filter)
    staff = query.first()
    if staff is None:
        raise HTTPException(status_code=404, detail="Staff not found")
    return staff

@router.put("/{staff_id}", response_model=StaffResponse)
def update_staff(
    staff_id: str,
    staff_update: StaffUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    db_staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if db_staff is None:
        raise HTTPException(status_code=404, detail="Staff not found")
    
    update_data = staff_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_staff, key, value)
    
    db.commit()
    db.refresh(db_staff)
    return db_staff

@router.delete("/{staff_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_staff(
    staff_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    db_staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if db_staff is None:
        raise HTTPException(status_code=404, detail="Staff not found")
    
    db.delete(db_staff)
    db.commit()
    return None
