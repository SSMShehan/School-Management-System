from pydantic import BaseModel
from typing import Optional
from datetime import date, time
from uuid import UUID
from enum import Enum


class StaffAttendanceStatusEnum(str, Enum):
    present = "present"
    absent = "absent"
    late = "late"
    half_day = "half_day"
    on_leave = "on_leave"


class StaffAttendanceBase(BaseModel):
    staff_id: UUID
    date: date
    status: StaffAttendanceStatusEnum
    check_in_time: Optional[time] = None
    check_out_time: Optional[time] = None
    remarks: Optional[str] = None


class StaffAttendanceCreate(StaffAttendanceBase):
    pass


class StaffAttendanceUpdate(BaseModel):
    status: Optional[StaffAttendanceStatusEnum] = None
    check_in_time: Optional[time] = None
    check_out_time: Optional[time] = None
    remarks: Optional[str] = None


class StaffAttendanceResponse(StaffAttendanceBase):
    id: UUID
    branch_id: Optional[UUID] = None

    class Config:
        from_attributes = True
