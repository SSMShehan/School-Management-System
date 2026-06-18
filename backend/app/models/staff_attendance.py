from sqlalchemy import Column, Date, String, ForeignKey, Enum, Time
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum
from ..database import Base


class StaffAttendanceStatus(str, enum.Enum):
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    HALF_DAY = "half_day"
    ON_LEAVE = "on_leave"


class StaffAttendance(Base):
    __tablename__ = "staff_attendance"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    staff_id = Column(UUID(as_uuid=True), ForeignKey("staff.id"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(Enum(StaffAttendanceStatus), nullable=False)
    check_in_time = Column(Time, nullable=True)
    check_out_time = Column(Time, nullable=True)
    remarks = Column(String, nullable=True)
    
    # Multi-branch support
    branch_id = Column(UUID(as_uuid=True), ForeignKey("branches.branch_id"), nullable=True)

    # Relationships
    staff = relationship("Staff", backref="attendance_records")
    branch = relationship("Branch", backref="staff_attendance_records")
