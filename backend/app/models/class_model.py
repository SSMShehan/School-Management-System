from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from ..database import Base

class Class(Base):
    __tablename__ = "classes"

    class_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    grade = Column(String, nullable=False) # e.g. "Grade 10"
    section = Column(String, nullable=False) # e.g. "A"
    class_teacher_id = Column(UUID(as_uuid=True), ForeignKey("staff.id"), nullable=True)
    
    # Multi-branch support
    branch_id = Column(UUID(as_uuid=True), ForeignKey("branches.branch_id"), nullable=True)

    # Relationships
    students = relationship("Student", back_populates="student_class")
    teacher = relationship("Staff", backref="classes_managed")
    branch = relationship("Branch", back_populates="classes")
