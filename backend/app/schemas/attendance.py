from pydantic import BaseModel
from typing import Optional
from datetime import date
from uuid import UUID
from enum import Enum

class AttendanceStatusEnum(str, Enum):
    present = "present"
    absent = "absent"
    late = "late"
    excused = "excused"

class AttendanceBase(BaseModel):
    student_id: UUID
    date: date
    status: AttendanceStatusEnum
    remarks: Optional[str] = None

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(BaseModel):
    status: Optional[AttendanceStatusEnum] = None
    remarks: Optional[str] = None

class AttendanceResponse(AttendanceBase):
    id: UUID

    class Config:
        from_attributes = True
