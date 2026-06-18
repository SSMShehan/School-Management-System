from sqlalchemy import Column, String, Numeric, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid
from ..database import Base

class FeeStructure(Base):
    __tablename__ = "fee_structures"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)  # e.g. "Tuition Fee", "Library Fee"
    grade = Column(String, nullable=False)  # e.g. "Grade 10", "All"
    amount = Column(Numeric(10, 2), nullable=False)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
