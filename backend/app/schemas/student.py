from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date
from uuid import UUID

class StudentBase(BaseModel):
    full_name: str
    date_of_birth: date
    gender: str
    grade_level: str
    guardian_name: str
    guardian_contact: str
    guardian_email: Optional[EmailStr] = None
    emergency_contact: Optional[str] = None
    address: Optional[str] = None
    medical_info: Optional[str] = None
    admission_date: date

class StudentCreate(StudentBase):
    student_id: Optional[str] = None  # Optional, will be auto-generated if not provided

class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    grade_level: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_contact: Optional[str] = None
    guardian_email: Optional[EmailStr] = None
    emergency_contact: Optional[str] = None
    address: Optional[str] = None
    medical_info: Optional[str] = None

class StudentResponse(StudentBase):
    id: UUID
    student_id: str
    branch_id: Optional[UUID] = None

    class Config:
        from_attributes = True
