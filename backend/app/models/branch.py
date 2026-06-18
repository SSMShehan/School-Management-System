from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from ..database import Base


class Branch(Base):
    __tablename__ = "branches"

    branch_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, unique=True)
    location = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships will be back_populated from other models
    students = relationship("Student", back_populates="branch")
    staff = relationship("Staff", back_populates="branch")
    classes = relationship("Class", back_populates="branch")
    payments = relationship("Payment", back_populates="branch")
    users = relationship("User", back_populates="branch")
