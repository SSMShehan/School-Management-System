from sqlalchemy import Column, String, Date, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from ..database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # student_id is a unique identifier string (e.g., STU-001)
    student_id = Column(String, unique=True, index=True)
    admission_no = Column(String, unique=True, index=True, nullable=True)
    full_name = Column(String, nullable=False)
    date_of_birth = Column(Date)  # Renamed from dob for consistency
    gender = Column(String)
    grade_level = Column(String)
    
    # Guardian Information
    guardian_name = Column(String)
    guardian_contact = Column(String)
    guardian_email = Column(String, nullable=True)
    emergency_contact = Column(String, nullable=True)
    
    # Additional Information
    address = Column(Text, nullable=True)
    medical_info = Column(Text, nullable=True)
    
    admission_date = Column(Date)
    class_id = Column(UUID(as_uuid=True), ForeignKey("classes.class_id"), nullable=True)
    
    # Multi-branch support
    branch_id = Column(UUID(as_uuid=True), ForeignKey("branches.branch_id"), nullable=True)

    # Relationships
    student_class = relationship("Class", back_populates="students")
    branch = relationship("Branch", back_populates="students")
