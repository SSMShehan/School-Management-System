from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date
from uuid import UUID
from decimal import Decimal

class StaffBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: str
    role: str
    salary: Decimal
    join_date: date
    qualifications: Optional[str] = None

class StaffCreate(StaffBase):
    pass

class StaffUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    salary: Optional[Decimal] = None
    qualifications: Optional[str] = None

class StaffResponse(StaffBase):
    id: UUID
    branch_id: Optional[UUID] = None

    class Config:
        from_attributes = True
