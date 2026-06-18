from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.fee_structure import FeeStructure
from ..models.user import User
from ..schemas.fee_structure import FeeStructureCreate, FeeStructureResponse, FeeStructureUpdate
from ..auth import get_current_active_user, admin_only

router = APIRouter(prefix="/fees", tags=["Fee Structure"])

@router.post("/", response_model=FeeStructureResponse)
def create_fee_structure(
    fee: FeeStructureCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    db_fee = FeeStructure(**fee.dict())
    db.add(db_fee)
    db.commit()
    db.refresh(db_fee)
    return db_fee

@router.get("/", response_model=List[FeeStructureResponse])
def read_all_fees(
    grade: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(FeeStructure).filter(FeeStructure.is_active == True)
    if grade:
        query = query.filter(FeeStructure.grade == grade)
    return query.all()

@router.get("/{fee_id}", response_model=FeeStructureResponse)
def read_fee_structure(
    fee_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    fee = db.query(FeeStructure).filter(FeeStructure.id == fee_id).first()
    if fee is None:
        raise HTTPException(status_code=404, detail="Fee structure not found")
    return fee

@router.put("/{fee_id}", response_model=FeeStructureResponse)
def update_fee_structure(
    fee_id: str,
    fee_update: FeeStructureUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    db_fee = db.query(FeeStructure).filter(FeeStructure.id == fee_id).first()
    if db_fee is None:
        raise HTTPException(status_code=404, detail="Fee structure not found")
    
    update_data = fee_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_fee, key, value)
    
    db.commit()
    db.refresh(db_fee)
    return db_fee

@router.delete("/{fee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_fee_structure(
    fee_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    db_fee = db.query(FeeStructure).filter(FeeStructure.id == fee_id).first()
    if db_fee is None:
        raise HTTPException(status_code=404, detail="Fee structure not found")
    
    db.delete(db_fee)
    db.commit()
    return None
