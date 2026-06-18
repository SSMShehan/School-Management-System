from sqlalchemy import Column, String, Date, Numeric, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from ..database import Base

class Staff(Base):
    __tablename__ = "staff"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=False)  # Renamed from contact
    role = Column(String, nullable=False)
    salary = Column(Numeric(10, 2), nullable=False)
    join_date = Column(Date, nullable=False)
    qualifications = Column(Text, nullable=True)
    
    # Multi-branch support
    branch_id = Column(UUID(as_uuid=True), ForeignKey("branches.branch_id"), nullable=True)

    # Relationships
    branch = relationship("Branch", back_populates="staff")
