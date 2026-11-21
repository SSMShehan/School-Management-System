import sys
import os
import uuid
from datetime import date, datetime, time, timedelta

sys.path.append('.')

from app.database import SessionLocal, engine, Base
from app.auth.security import get_password_hash
from app.models.branch import Branch
from app.models.user import User, UserRole
from app.models.staff import Staff
from app.models.class_model import Class
from app.models.student import Student
from app.models.fee_structure import FeeStructure
from app.models.payment import Payment, PaymentStatus
from app.models.attendance import Attendance, AttendanceStatus
from app.models.staff_attendance import StaffAttendance, StaffAttendanceStatus

def seed_database():
    print("=" * 60)
    print("🚀 Starting Database Seeding for Neon Cloud PostgreSQL...")
    print("=" * 60)
    
    # Ensure all tables exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Branches
        print("\n[1/7] Seeding Branches...")
        colombo_branch = db.query(Branch).filter(Branch.name == "Colombo Main Campus").first()
        if not colombo_branch:
            colombo_branch = Branch(
                branch_id=uuid.uuid4(),
                name="Colombo Main Campus",
                location="No. 120, Reid Avenue, Colombo 07",
                is_active=True,
                created_at=datetime.utcnow()
            )
            db.add(colombo_branch)

        kandy_branch = db.query(Branch).filter(Branch.name == "Kandy Branch").first()
        if not kandy_branch:
            kandy_branch = Branch(
                branch_id=uuid.uuid4(),
                name="Kandy Branch",
                location="No. 45, Peradeniya Road, Kandy",
                is_active=True,
                created_at=datetime.utcnow()
            )
            db.add(kandy_branch)

        db.commit()
        db.refresh(colombo_branch)
        db.refresh(kandy_branch)
        print(f"  ✓ Colombo Branch: {colombo_branch.branch_id}")
        print(f"  ✓ Kandy Branch: {kandy_branch.branch_id}")

        # 2. Seed Users
        print("\n[2/7] Seeding Users with Different Roles...")
        users_to_seed = [
            ("admin", "admin123", UserRole.ADMIN, None),
            ("principal", "principal123", UserRole.PRINCIPAL, colombo_branch.branch_id),
            ("registrar", "registrar123", UserRole.REGISTRAR, colombo_branch.branch_id),
            ("accountant", "accountant123", UserRole.ACCOUNTANT, colombo_branch.branch_id),
            ("teacher", "teacher123", UserRole.TEACHER, colombo_branch.branch_id),
            ("teacher_kandy", "teacher123", UserRole.TEACHER, kandy_branch.branch_id),
        ]

        for username, plain_pass, role, b_id in users_to_seed:
            existing = db.query(User).filter(User.username == username).first()
            if not existing:
                u = User(
                    id=str(uuid.uuid4()),
                    username=username,
                    password_hash=get_password_hash(plain_pass),
                    role=role,
                    branch_id=b_id
                )
                db.add(u)
                print(f"  ✓ Created user: {username} ({role.value})")
            else:
                print(f"  • User {username} already exists")
        db.commit()

        # 3. Seed Staff Members
        print("\n[3/7] Seeding Staff Members...")
        staff_data = [
            {
                "name": "Dr. Samantha Perera",
                "email": "samantha.p@school.lk",
                "phone": "+94771234567",
                "role": "Principal",
                "salary": 150000.00,
                "join_date": date(2020, 1, 15),
                "qualifications": "PhD in Educational Leadership, M.Sc",
                "branch_id": colombo_branch.branch_id
            },
            {
                "name": "Mrs. Anula Jayasinghe",
                "email": "anula.j@school.lk",
                "phone": "+94772345678",
                "role": "Senior Teacher",
                "salary": 95000.00,
                "join_date": date(2021, 3, 1),
                "qualifications": "B.Sc. Mathematics, PGDE",
                "branch_id": colombo_branch.branch_id
            },
            {
                "name": "Mr. Nimal Wickramasinghe",
                "email": "nimal.w@school.lk",
                "phone": "+94773456789",
                "role": "Teacher",
                "salary": 85000.00,
                "join_date": date(2022, 1, 10),
                "qualifications": "B.Sc. Physical Science",
                "branch_id": colombo_branch.branch_id
            },
            {
                "name": "Ms. Dilini Fernando",
                "email": "dilini.f@school.lk",
                "phone": "+94774567890",
                "role": "Teacher",
                "salary": 82000.00,
                "join_date": date(2023, 5, 15),
                "qualifications": "BA in English Language & Literature",
                "branch_id": colombo_branch.branch_id
            },
            {
                "name": "Mr. Roshan Silva",
                "email": "roshan.s@school.lk",
                "phone": "+94775678901",
                "role": "Accountant",
                "salary": 90000.00,
                "join_date": date(2021, 8, 1),
                "qualifications": "B.Com, CIMA Passed Finalist",
                "branch_id": colombo_branch.branch_id
            }
        ]

        staff_map = {}
        for s_info in staff_data:
            existing = db.query(Staff).filter(Staff.email == s_info["email"]).first()
            if not existing:
                member = Staff(id=uuid.uuid4(), **s_info)
                db.add(member)
                db.commit()
                db.refresh(member)
                staff_map[member.name] = member
                print(f"  ✓ Added staff: {member.name} ({member.role})")
            else:
                staff_map[existing.name] = existing
                print(f"  • Staff {existing.name} already exists")

        # 4. Seed Classes
        print("\n[4/7] Seeding Classes...")
        classes_data = [
            {"grade": "Grade 10", "section": "A", "teacher_name": "Mrs. Anula Jayasinghe", "branch_id": colombo_branch.branch_id},
            {"grade": "Grade 10", "section": "B", "teacher_name": "Mr. Nimal Wickramasinghe", "branch_id": colombo_branch.branch_id},
            {"grade": "Grade 11", "section": "A", "teacher_name": "Ms. Dilini Fernando", "branch_id": colombo_branch.branch_id},
            {"grade": "Grade 12", "section": "Science", "teacher_name": "Mrs. Anula Jayasinghe", "branch_id": colombo_branch.branch_id},
        ]

        class_map = {}
        for c_info in classes_data:
            existing = db.query(Class).filter(
                Class.grade == c_info["grade"],
                Class.section == c_info["section"],
                Class.branch_id == c_info["branch_id"]
            ).first()
            teacher = staff_map.get(c_info["teacher_name"])
            if not existing:
                new_class = Class(
                    class_id=uuid.uuid4(),
                    grade=c_info["grade"],
                    section=c_info["section"],
                    class_teacher_id=teacher.id if teacher else None,
                    branch_id=c_info["branch_id"]
                )
                db.add(new_class)
                db.commit()
                db.refresh(new_class)
                class_map[f"{new_class.grade}-{new_class.section}"] = new_class
                print(f"  ✓ Created class: {new_class.grade} {new_class.section}")
            else:
                class_map[f"{existing.grade}-{existing.section}"] = existing
                print(f"  • Class {existing.grade} {existing.section} exists")

        # 5. Seed Fee Structures
        print("\n[5/7] Seeding Fee Structures...")
        fee_data = [
            {"name": "Term 1 Tuition Fee", "grade": "All", "amount": 25000.00, "description": "Standard first term tuition fee"},
            {"name": "Annual Facility & IT Fee", "grade": "All", "amount": 10000.00, "description": "Campus facilities, sports ground and IT lab usage"},
            {"name": "Grade 10 Science Practical Fee", "grade": "Grade 10", "amount": 5000.00, "description": "Laboratory equipment and chemicals"},
            {"name": "Grade 11 Seminar & Exam Fee", "grade": "Grade 11", "amount": 7500.00, "description": "Mock examination papers and revisions"},
        ]

        for f_info in fee_data:
            existing = db.query(FeeStructure).filter(FeeStructure.name == f_info["name"]).first()
            if not existing:
                fee = FeeStructure(id=uuid.uuid4(), is_active=True, **f_info)
                db.add(fee)
                print(f"  ✓ Added fee structure: {fee.name} (LKR {fee.amount:,.2f})")
            else:
                print(f"  • Fee structure {f_info['name']} exists")
        db.commit()

        # 6. Seed Students
        print("\n[6/7] Seeding Students...")
        students_data = [
            {
                "student_id": "STU-001",
                "admission_no": "ADM-2024-001",
                "full_name": "Kasun Madushanka",
                "date_of_birth": date(2008, 5, 14),
                "gender": "Male",
                "grade_level": "Grade 10",
                "guardian_name": "Sunil Madushanka",
                "guardian_contact": "+94711122334",
                "guardian_email": "sunil.m@gmail.com",
                "emergency_contact": "+94711122335",
                "address": "No. 45, Galle Road, Colombo 03",
                "medical_info": "No known allergies",
                "admission_date": date(2024, 1, 10),
                "class_key": "Grade 10-A",
                "branch_id": colombo_branch.branch_id
            },
            {
                "student_id": "STU-002",
                "admission_no": "ADM-2024-002",
                "full_name": "Sanduni Senanayake",
                "date_of_birth": date(2008, 9, 22),
                "gender": "Female",
                "grade_level": "Grade 10",
                "guardian_name": "Priyantha Senanayake",
                "guardian_contact": "+94712233445",
                "guardian_email": "priyantha.s@gmail.com",
                "emergency_contact": "+94712233446",
                "address": "12/A, Kandy Road, Kiribathgoda",
                "medical_info": "Mild asthma (inhaler available)",
                "admission_date": date(2024, 1, 10),
                "class_key": "Grade 10-A",
                "branch_id": colombo_branch.branch_id
            },
            {
                "student_id": "STU-003",
                "admission_no": "ADM-2024-003",
                "full_name": "Nuwan Dissanayake",
                "date_of_birth": date(2008, 2, 18),
                "gender": "Male",
                "grade_level": "Grade 10",
                "guardian_name": "Bandula Dissanayake",
                "guardian_contact": "+94713344556",
                "guardian_email": "bandula.d@gmail.com",
                "emergency_contact": "+94713344557",
                "address": "78, High Level Road, Nugegoda",
                "medical_info": "None",
                "admission_date": date(2024, 1, 12),
                "class_key": "Grade 10-B",
                "branch_id": colombo_branch.branch_id
            },
            {
                "student_id": "STU-004",
                "admission_no": "ADM-2023-015",
                "full_name": "Dinithi Alwis",
                "date_of_birth": date(2007, 11, 5),
                "gender": "Female",
                "grade_level": "Grade 11",
                "guardian_name": "Mahinda Alwis",
                "guardian_contact": "+94714455667",
                "guardian_email": "mahinda.a@gmail.com",
                "emergency_contact": "+94714455668",
                "address": "23, Station Road, Dehiwala",
                "medical_info": "None",
                "admission_date": date(2023, 1, 9),
                "class_key": "Grade 11-A",
                "branch_id": colombo_branch.branch_id
            },
            {
                "student_id": "STU-005",
                "admission_no": "ADM-2022-042",
                "full_name": "Tharindu Bandara",
                "date_of_birth": date(2006, 7, 30),
                "gender": "Male",
                "grade_level": "Grade 12",
                "guardian_name": "Gamini Bandara",
                "guardian_contact": "+94715566778",
                "guardian_email": "gamini.b@gmail.com",
                "emergency_contact": "+94715566779",
                "address": "90, Temple Road, Maharagama",
                "medical_info": "None",
                "admission_date": date(2022, 1, 8),
                "class_key": "Grade 12-Science",
                "branch_id": colombo_branch.branch_id
            }
        ]

        student_records = []
        for stu_info in students_data:
            existing = db.query(Student).filter(Student.student_id == stu_info["student_id"]).first()
            class_obj = class_map.get(stu_info["class_key"])
            if not existing:
                stu_dict = dict(stu_info)
                del stu_dict["class_key"]
                stu_dict["class_id"] = class_obj.class_id if class_obj else None
                s = Student(id=uuid.uuid4(), **stu_dict)
                db.add(s)
                db.commit()
                db.refresh(s)
                student_records.append(s)
                print(f"  ✓ Added student: {s.full_name} ({s.student_id})")
            else:
                student_records.append(existing)
                print(f"  • Student {existing.full_name} exists")

        # 7. Seed Payments and Attendance
        print("\n[7/7] Seeding Payments and Attendance Records...")
        # Payments
        sample_payments = [
            {"student_idx": 0, "amount": 25000.00, "method": "bank_transfer", "receipt_no": "REC-2026-001", "status": PaymentStatus.PAID, "remarks": "Term 1 fee full payment"},
            {"student_idx": 1, "amount": 25000.00, "method": "cash", "receipt_no": "REC-2026-002", "status": PaymentStatus.PAID, "remarks": "Term 1 fee cash payment"},
            {"student_idx": 2, "amount": 10000.00, "method": "card", "receipt_no": "REC-2026-003", "status": PaymentStatus.PAID, "remarks": "Facility & IT fee payment"},
            {"student_idx": 3, "amount": 32500.00, "method": "online", "receipt_no": "REC-2026-004", "status": PaymentStatus.PAID, "remarks": "Tuition and exam fees"},
            {"student_idx": 4, "amount": 25000.00, "method": "online", "receipt_no": "REC-2026-005", "status": PaymentStatus.PENDING, "remarks": "Online invoice generated, pending payment"},
        ]

        for p_info in sample_payments:
            if p_info["student_idx"] < len(student_records):
                stu = student_records[p_info["student_idx"]]
                existing = db.query(Payment).filter(Payment.receipt_no == p_info["receipt_no"]).first()
                if not existing:
                    pay = Payment(
                        id=uuid.uuid4(),
                        student_id=stu.id,
                        amount=p_info["amount"],
                        payment_date=datetime.utcnow() - timedelta(days=p_info["student_idx"] * 2),
                        payment_method=p_info["method"],
                        receipt_no=p_info["receipt_no"],
                        status=p_info["status"],
                        remarks=p_info["remarks"],
                        branch_id=stu.branch_id
                    )
                    db.add(pay)
                    print(f"  ✓ Payment record: {pay.receipt_no} - LKR {pay.amount:,.2f} ({pay.status.value})")

        # Attendance for past 3 days
        today = date.today()
        dates = [today - timedelta(days=2), today - timedelta(days=1), today]
        statuses = [AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.PRESENT, AttendanceStatus.EXCUSED]

        for d_idx, day in enumerate(dates):
            for s_idx, stu in enumerate(student_records):
                status_to_assign = statuses[(s_idx + d_idx) % len(statuses)]
                existing = db.query(Attendance).filter(
                    Attendance.student_id == stu.id,
                    Attendance.date == day
                ).first()
                if not existing:
                    att = Attendance(
                        id=uuid.uuid4(),
                        student_id=stu.id,
                        date=day,
                        status=status_to_assign,
                        remarks="On-time" if status_to_assign == AttendanceStatus.PRESENT else ("Traffic delay" if status_to_assign == AttendanceStatus.LATE else "Medical leave")
                    )
                    db.add(att)

        # Staff attendance for past 3 days
        all_staff = db.query(Staff).all()
        for d_idx, day in enumerate(dates):
            for staff_member in all_staff:
                existing = db.query(StaffAttendance).filter(
                    StaffAttendance.staff_id == staff_member.id,
                    StaffAttendance.date == day
                ).first()
                if not existing:
                    s_att = StaffAttendance(
                        id=uuid.uuid4(),
                        staff_id=staff_member.id,
                        date=day,
                        status=StaffAttendanceStatus.PRESENT,
                        check_in_time=time(7, 45),
                        check_out_time=time(14, 30),
                        remarks="Regular duty",
                        branch_id=staff_member.branch_id
                    )
                    db.add(s_att)

        db.commit()
        print("  ✓ Added attendance records for students and staff")

        print("\n" + "=" * 60)
        print("🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        print("\n🔑 Credentials for testing:")
        print("  • Admin:      admin / admin123")
        print("  • Principal:  principal / principal123")
        print("  • Registrar:  registrar / registrar123")
        print("  • Accountant: accountant / accountant123")
        print("  • Teacher:    teacher / teacher123")

    except Exception as e:
        db.rollback()
        print(f"\n❌ ERROR DURING SEEDING: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
