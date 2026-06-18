from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from decimal import Decimal

class FeeStructureBase(BaseModel):
    name: str
    grade: str
    amount: Decimal
    description: Optional[str] = None
    is_active: bool = True

class FeeStructureCreate(FeeStructureBase):
    pass

class FeeStructureUpdate(BaseModel):
    name: Optional[str] = None
    grade: Optional[str] = None
    amount: Optional[Decimal] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class FeeStructureResponse(FeeStructureBase):
    id: UUID

    class Config:
        from_attributes = True
