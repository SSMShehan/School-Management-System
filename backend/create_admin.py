import sys
sys.path.append('.')

from app.auth.security import get_password_hash
from app.database import SessionLocal
from app.models.user import User, UserRole
import uuid

# Create database session
db = SessionLocal()

try:
    # Check if admin user exists
    existing_admin = db.query(User).filter(User.username == "admin").first()
    
    if existing_admin:
        print("[INFO] Admin user already exists!")
        print(f"Username: {existing_admin.username}")
        print(f"Role: {existing_admin.role}")
    else:
        # Create admin user
        print("[INFO] Creating admin user...")
        hashed_password = get_password_hash("admin123")
        
        admin_user = User(
            id=str(uuid.uuid4()),
            username="admin",
            password_hash=hashed_password,
            role=UserRole.ADMIN,
            branch_id=None  # Admin can access all branches
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("[SUCCESS] Admin user created successfully!")
        print(f"Username: admin")
        print(f"Password: admin123")
        print(f"Role: {admin_user.role}")
        
except Exception as e:
    print(f"[ERROR] Failed to create admin user: {e}")
    db.rollback()
finally:
    db.close()
