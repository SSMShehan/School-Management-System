from sqlalchemy import Column, String, Enum, ForeignKey
from sqlalchemy.orm import relationship
import uuid
import enum
from ..database import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    REGISTRAR = "registrar"
    ACCOUNTANT = "accountant"
    TEACHER = "teacher"
    PRINCIPAL = "principal"

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    
    # Multi-branch support (nullable for admin who can access all branches)
    branch_id = Column(String(36), ForeignKey("branches.branch_id"), nullable=True)

    # Relationships
    branch = relationship("Branch", back_populates="users")
