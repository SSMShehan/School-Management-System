from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from decimal import Decimal
from ..database import get_db
from ..models.student import Student
from ..models.staff import Staff
from ..models.payment import Payment, PaymentStatus
from ..models.user import User
from ..schemas.dashboard import DashboardSummary
from ..auth import get_current_active_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Count totals
    total_students = db.query(func.count(Student.id)).scalar() or 0
    total_staff = db.query(func.count(Staff.id)).scalar() or 0
    total_payments = db.query(func.count(Payment.id)).scalar() or 0
    
    # Count pending payments
    pending_payments = db.query(func.count(Payment.id)).filter(
        Payment.status == PaymentStatus.PENDING
    ).scalar() or 0
    
    # Calculate total income (paid payments)
    total_income = db.query(func.sum(Payment.amount)).filter(
        Payment.status == PaymentStatus.PAID
    ).scalar() or Decimal("0.00")
    
    # Calculate pending amount
    pending_amount = db.query(func.sum(Payment.amount)).filter(
        Payment.status == PaymentStatus.PENDING
    ).scalar() or Decimal("0.00")
    
    return DashboardSummary(
        total_students=total_students,
        total_staff=total_staff,
        total_payments=total_payments,
        pending_payments=pending_payments,
        total_income=total_income,
        pending_amount=pending_amount
    )
