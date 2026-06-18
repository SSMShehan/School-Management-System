from pydantic import BaseModel, EmailStr
from uuid import UUID
from typing import Optional
from ..models.user import UserRole

class UserBase(BaseModel):
    username: str
    role: UserRole

class UserCreate(UserBase):
    password: str
    branch_id: Optional[UUID] = None  # Optional branch assignment

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: UUID
    branch_id: Optional[UUID] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
