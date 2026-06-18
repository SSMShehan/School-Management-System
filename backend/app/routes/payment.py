from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from io import BytesIO
from uuid import UUID
from ..database import get_db
from ..models.payment import Payment
from ..models.student import Student
from ..models.user import User
from ..schemas.payment import PaymentCreate, PaymentResponse, PaymentUpdate
from ..auth import get_current_active_user, admin_only, get_branch_filter

# PDF Generation imports
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch

router = APIRouter(prefix="/payments", tags=["Payments"])

def generate_receipt_number():
    """Generate unique receipt number"""
    import uuid
    return f"RCP-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

@router.post("/", response_model=PaymentResponse)
def create_payment(
    payment: PaymentCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    # Auto-generate receipt number
    payment_data = payment.model_dump()
    payment_data['receipt_no'] = generate_receipt_number()
    
    # Convert payment_date from date to datetime if provided
    if payment_data.get('payment_date'):
        from datetime import datetime as dt
        payment_date = payment_data.pop('payment_date')
        payment_data['payment_date'] = dt.combine(payment_date, dt.min.time())
    else:
        payment_data['payment_date'] = datetime.utcnow()
    
    # Assign branch_id from current user
    branch_id = getattr(current_user, '_token_branch_id', None) or current_user.branch_id
    
    db_payment = Payment(**payment_data, branch_id=branch_id)
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

@router.get("/", response_model=List[PaymentResponse])
def read_all_payments(
    skip: int = 0, 
    limit: int = 100, 
    status_filter: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    branch_filter: Optional[UUID] = Depends(get_branch_filter)
):
    """List payments - filtered by branch for non-admin users"""
    query = db.query(Payment)
    if branch_filter:
        query = query.filter(Payment.branch_id == branch_filter)
    if status_filter:
        query = query.filter(Payment.status == status_filter)
    payments = query.offset(skip).limit(limit).all()
    return payments

@router.get("/{payment_id}", response_model=PaymentResponse)
def read_payment(
    payment_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    branch_filter: Optional[UUID] = Depends(get_branch_filter)
):
    query = db.query(Payment).filter(Payment.id == payment_id)
    if branch_filter:
        query = query.filter(Payment.branch_id == branch_filter)
    payment = query.first()
    if payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment

@router.get("/student/{student_id}", response_model=List[PaymentResponse])
def read_payments_by_student(
    student_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    branch_filter: Optional[UUID] = Depends(get_branch_filter)
):
    query = db.query(Payment).filter(Payment.student_id == student_id)
    if branch_filter:
        query = query.filter(Payment.branch_id == branch_filter)
    payments = query.all()
    return payments

@router.get("/{payment_id}/receipt")
def download_receipt(
    payment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    branch_filter: Optional[UUID] = Depends(get_branch_filter)
):
    """Generate and download PDF receipt for a payment"""
    query = db.query(Payment).filter(Payment.id == payment_id)
    if branch_filter:
        query = query.filter(Payment.branch_id == branch_filter)
    payment = query.first()
    if payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # Get student details
    student = db.query(Student).filter(Student.id == payment.student_id).first()
    student_name = student.full_name if student else "Unknown Student"
    
    # Create PDF
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    
    # Header
    p.setFont("Helvetica-Bold", 20)
    p.drawCentredString(width/2, height - 1*inch, "SCHOOL MANAGEMENT SYSTEM")
    p.setFont("Helvetica", 12)
    p.drawCentredString(width/2, height - 1.3*inch, "Payment Receipt")
    
    # Line
    p.line(50, height - 1.5*inch, width - 50, height - 1.5*inch)
    
    # Receipt details
    y_position = height - 2*inch
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y_position, f"Receipt No: {payment.receipt_no}")
    p.drawString(300, y_position, f"Date: {payment.payment_date.strftime('%Y-%m-%d')}")
    
    y_position -= 0.5*inch
    p.setFont("Helvetica", 11)
    p.drawString(50, y_position, f"Student Name: {student_name}")
    
    y_position -= 0.3*inch
    p.drawString(50, y_position, f"Amount Paid: Rs. {payment.amount}")
    
    y_position -= 0.3*inch
    p.drawString(50, y_position, f"Status: {payment.status.value.upper()}")
    
    # Footer
    p.line(50, 1.5*inch, width - 50, 1.5*inch)
    p.setFont("Helvetica-Oblique", 9)
    p.drawCentredString(width/2, 1.2*inch, "Thank you for your payment!")
    p.drawCentredString(width/2, 1*inch, "This is a computer-generated receipt.")
    
    p.save()
    buffer.seek(0)
    
    return StreamingResponse(
        buffer, 
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=receipt_{payment.receipt_no}.pdf"}
    )

@router.put("/{payment_id}", response_model=PaymentResponse)
def update_payment(
    payment_id: str,
    payment_update: PaymentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    db_payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if db_payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    update_data = payment_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_payment, key, value)
    
    db.commit()
    db.refresh(db_payment)
    return db_payment

@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment(
    payment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    db_payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if db_payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    db.delete(db_payment)
    db.commit()
    return None
