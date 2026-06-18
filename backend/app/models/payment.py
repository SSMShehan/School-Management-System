from sqlalchemy import Column, String, DateTime, Numeric, ForeignKey, Enum, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum
from datetime import datetime
from ..database import Base

class PaymentStatus(str, enum.Enum):
    PAID = "paid"
    PENDING = "pending"
    FAILED = "failed"

class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    payment_date = Column(DateTime, default=datetime.utcnow)
    payment_method = Column(String, nullable=True)  # cash, card, online, cheque
    receipt_no = Column(String, unique=True, nullable=False)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    remarks = Column(Text, nullable=True)
    
    # Multi-branch support
    branch_id = Column(UUID(as_uuid=True), ForeignKey("branches.branch_id"), nullable=True)

    # Relationships
    student = relationship("Student", backref="payments")
    branch = relationship("Branch", back_populates="payments")
