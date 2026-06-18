from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.branch import Branch
from ..models.user import User
from ..schemas.branch import BranchCreate, BranchResponse, BranchUpdate
from ..auth import get_current_active_user, admin_only

router = APIRouter(prefix="/branches", tags=["Branches"])


@router.get("/", response_model=List[BranchResponse])
def list_branches(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)  # Admin only
):
    """List all branches (admin only)"""
    branches = db.query(Branch).offset(skip).limit(limit).all()
    return branches


@router.get("/{branch_id}", response_model=BranchResponse)
def get_branch(
    branch_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)  # Admin only
):
    """Get a specific branch by ID (admin only)"""
    branch = db.query(Branch).filter(Branch.branch_id == branch_id).first()
    if branch is None:
        raise HTTPException(status_code=404, detail="Branch not found")
    return branch


@router.post("/", response_model=BranchResponse, status_code=status.HTTP_201_CREATED)
def create_branch(
    branch: BranchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)  # Admin only
):
    """Create a new branch (admin only)"""
    # Check if branch name already exists
    existing = db.query(Branch).filter(Branch.name == branch.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Branch with this name already exists")
    
    db_branch = Branch(**branch.model_dump())
    db.add(db_branch)
    db.commit()
    db.refresh(db_branch)
    return db_branch


@router.put("/{branch_id}", response_model=BranchResponse)
def update_branch(
    branch_id: str,
    branch_update: BranchUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)  # Admin only
):
    """Update a branch (admin only)"""
    db_branch = db.query(Branch).filter(Branch.branch_id == branch_id).first()
    if db_branch is None:
        raise HTTPException(status_code=404, detail="Branch not found")
    
    update_data = branch_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_branch, key, value)
    
    db.commit()
    db.refresh(db_branch)
    return db_branch


@router.delete("/{branch_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_branch(
    branch_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)  # Admin only
):
    """Delete a branch (admin only)"""
    db_branch = db.query(Branch).filter(Branch.branch_id == branch_id).first()
    if db_branch is None:
        raise HTTPException(status_code=404, detail="Branch not found")
    
    db.delete(db_branch)
    db.commit()
    return None
