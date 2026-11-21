import sys
sys.path.append('.')

from app.database import SessionLocal
from app.models.user import User

db = SessionLocal()

try:
    users = db.query(User).all()
    print("\n=== Current Users in Database ===")
    if users:
        for user in users:
            print(f"ID: {user.id}")
            print(f"Username: {user.username}")
            print(f"Role: {user.role}")
            print(f"Branch ID: {user.branch_id}")
            print("-" * 40)
    else:
        print("No users found in database!")

    print(f"\nTotal users: {len(users)}")
except Exception as e:
    print(f"[ERROR] Failed to query users: {e}")
finally:
    db.close()
