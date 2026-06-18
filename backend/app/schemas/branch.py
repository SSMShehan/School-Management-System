from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import datetime


class BranchBase(BaseModel):
    name: str
    location: Optional[str] = None
    is_active: bool = True


class BranchCreate(BranchBase):
    """Schema for creating a new branch"""
    pass


class BranchUpdate(BaseModel):
    """Schema for updating a branch - all fields optional"""
    name: Optional[str] = None
    location: Optional[str] = None
    is_active: Optional[bool] = None


class BranchResponse(BranchBase):
    """Schema for branch response"""
    branch_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
