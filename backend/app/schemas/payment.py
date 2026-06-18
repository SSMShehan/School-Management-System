from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from uuid import UUID
from decimal import Decimal
from enum import Enum

class PaymentStatusEnum(str, Enum):
    pending = "pending"
    paid = "paid"
    failed = "failed"

class PaymentBase(BaseModel):
    student_id: UUID
    amount: Decimal
    payment_method: Optional[str] = "cash"  # cash, card, online, cheque
    payment_date: Optional[date] = None
    status: PaymentStatusEnum = PaymentStatusEnum.pending
    remarks: Optional[str] = None

class PaymentCreate(PaymentBase):
    pass  # receipt_no will be auto-generated

class PaymentUpdate(BaseModel):
    amount: Optional[Decimal] = None
    payment_method: Optional[str] = None
    status: Optional[PaymentStatusEnum] = None
    remarks: Optional[str] = None

class PaymentResponse(PaymentBase):
    id: UUID
    receipt_no: str
    payment_date: Optional[datetime] = None
    branch_id: Optional[UUID] = None

    class Config:
        from_attributes = True
