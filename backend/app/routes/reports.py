from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, datetime
from io import BytesIO
from typing import Optional

from ..database import get_db
from ..models.student import Student
from ..models.staff import Staff
from ..models.payment import Payment, PaymentStatus
from ..models.attendance import Attendance
from ..models.user import User
from ..auth import get_current_active_user

# PDF imports
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

# Excel imports
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, Border, Side, PatternFill

router = APIRouter(prefix="/reports", tags=["Reports"])

# ==================== STUDENT REPORTS ====================

@router.get("/students/excel")
def export_students_excel(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Export all students to Excel"""
    students = db.query(Student).all()
    
    wb = Workbook()
    ws = wb.active
    ws.title = "Students"
    
    # Header styling
    header_font = Font(bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
    
    # Headers
    headers = ["Admission No", "Full Name", "DOB", "Gender", "Grade", "Guardian", "Contact", "Admission Date"]
    for col, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col, value=header)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center")
    
    # Data rows
    for row, student in enumerate(students, 2):
        ws.cell(row=row, column=1, value=student.admission_no or "")
        ws.cell(row=row, column=2, value=student.full_name)
        ws.cell(row=row, column=3, value=str(student.dob) if student.dob else "")
        ws.cell(row=row, column=4, value=student.gender or "")
        ws.cell(row=row, column=5, value=student.grade_level or "")
        ws.cell(row=row, column=6, value=student.guardian_name or "")
        ws.cell(row=row, column=7, value=student.guardian_contact or "")
        ws.cell(row=row, column=8, value=str(student.admission_date) if student.admission_date else "")
    
    # Auto-adjust column widths
    for col in ws.columns:
        max_length = max(len(str(cell.value or "")) for cell in col)
        ws.column_dimensions[col[0].column_letter].width = max_length + 2
    
    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=students_{date.today()}.xlsx"}
    )

@router.get("/students/pdf")
def export_students_pdf(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Export all students to PDF"""
    students = db.query(Student).all()
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=landscape(A4))
    elements = []
    styles = getSampleStyleSheet()
    
    # Title
    elements.append(Paragraph("Student List Report", styles['Title']))
    elements.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}", styles['Normal']))
    elements.append(Spacer(1, 20))
    
    # Table data
    data = [["Admission No", "Name", "Grade", "Guardian", "Contact"]]
    for student in students:
        data.append([
            student.admission_no or "",
            student.full_name,
            student.grade_level or "",
            student.guardian_name or "",
            student.guardian_contact or ""
        ])
    
    # Create table
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4472C4')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#E2EFDA')),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    elements.append(table)
    
    doc.build(elements)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=students_{date.today()}.pdf"}
    )

# ==================== PAYMENT REPORTS ====================

@router.get("/payments/excel")
def export_payments_excel(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Export payments to Excel with optional date filter"""
    query = db.query(Payment)
    if start_date:
        query = query.filter(Payment.payment_date >= start_date)
    if end_date:
        query = query.filter(Payment.payment_date <= end_date)
    
    payments = query.all()
    
    wb = Workbook()
    ws = wb.active
    ws.title = "Payments"
    
    header_font = Font(bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="70AD47", end_color="70AD47", fill_type="solid")
    
    headers = ["Receipt No", "Student ID", "Amount", "Date", "Status"]
    for col, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col, value=header)
        cell.font = header_font
        cell.fill = header_fill
    
    total_amount = 0
    for row, payment in enumerate(payments, 2):
        ws.cell(row=row, column=1, value=payment.receipt_no)
        ws.cell(row=row, column=2, value=str(payment.student_id))
        ws.cell(row=row, column=3, value=float(payment.amount))
        ws.cell(row=row, column=4, value=payment.payment_date.strftime('%Y-%m-%d') if payment.payment_date else "")
        ws.cell(row=row, column=5, value=payment.status.value if payment.status else "")
        total_amount += float(payment.amount)
    
    # Total row
    total_row = len(payments) + 2
    ws.cell(row=total_row, column=2, value="TOTAL:").font = Font(bold=True)
    ws.cell(row=total_row, column=3, value=total_amount).font = Font(bold=True)
    
    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=payments_{date.today()}.xlsx"}
    )

@router.get("/payments/pdf")
def export_payments_pdf(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Export payments to PDF"""
    query = db.query(Payment)
    if start_date:
        query = query.filter(Payment.payment_date >= start_date)
    if end_date:
        query = query.filter(Payment.payment_date <= end_date)
    
    payments = query.all()
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    elements = []
    styles = getSampleStyleSheet()
    
    elements.append(Paragraph("Payment Report", styles['Title']))
    elements.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}", styles['Normal']))
    if start_date or end_date:
        elements.append(Paragraph(f"Period: {start_date or 'Start'} to {end_date or 'Present'}", styles['Normal']))
    elements.append(Spacer(1, 20))
    
    data = [["Receipt No", "Amount", "Date", "Status"]]
    total = 0
    for payment in payments:
        data.append([
            payment.receipt_no,
            f"Rs. {payment.amount}",
            payment.payment_date.strftime('%Y-%m-%d') if payment.payment_date else "",
            payment.status.value.upper() if payment.status else ""
        ])
        total += float(payment.amount)
    
    data.append(["", f"TOTAL: Rs. {total}", "", ""])
    
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#70AD47')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    elements.append(table)
    
    doc.build(elements)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=payments_{date.today()}.pdf"}
    )

# ==================== INCOME SUMMARY REPORT ====================

@router.get("/income-summary/pdf")
def export_income_summary_pdf(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Export income summary report to PDF"""
    
    # Get summary data
    total_students = db.query(func.count(Student.id)).scalar() or 0
    total_staff = db.query(func.count(Staff.id)).scalar() or 0
    
    total_paid = db.query(func.sum(Payment.amount)).filter(
        Payment.status == PaymentStatus.PAID
    ).scalar() or 0
    
    total_pending = db.query(func.sum(Payment.amount)).filter(
        Payment.status == PaymentStatus.PENDING
    ).scalar() or 0
    
    pending_count = db.query(func.count(Payment.id)).filter(
        Payment.status == PaymentStatus.PENDING
    ).scalar() or 0
    
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    
    # Title
    p.setFont("Helvetica-Bold", 24)
    p.drawCentredString(width/2, height - 1*inch, "Income Summary Report")
    
    p.setFont("Helvetica", 12)
    p.drawCentredString(width/2, height - 1.4*inch, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    
    p.line(50, height - 1.6*inch, width - 50, height - 1.6*inch)
    
    # Summary boxes
    y = height - 2.5*inch
    p.setFont("Helvetica-Bold", 14)
    
    p.drawString(50, y, "School Statistics")
    y -= 0.4*inch
    p.setFont("Helvetica", 12)
    p.drawString(70, y, f"Total Students: {total_students}")
    y -= 0.3*inch
    p.drawString(70, y, f"Total Staff: {total_staff}")
    
    y -= 0.6*inch
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, y, "Financial Summary")
    y -= 0.4*inch
    p.setFont("Helvetica", 12)
    p.drawString(70, y, f"Total Income (Paid): Rs. {float(total_paid):,.2f}")
    y -= 0.3*inch
    p.drawString(70, y, f"Pending Amount: Rs. {float(total_pending):,.2f}")
    y -= 0.3*inch
    p.drawString(70, y, f"Pending Payments Count: {pending_count}")
    
    # Footer
    p.line(50, 1.5*inch, width - 50, 1.5*inch)
    p.setFont("Helvetica-Oblique", 9)
    p.drawCentredString(width/2, 1.2*inch, "School Management System - Confidential Report")
    
    p.save()
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=income_summary_{date.today()}.pdf"}
    )
