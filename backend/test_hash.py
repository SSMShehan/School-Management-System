from passlib.context import CryptContext
import os

# Create context exactly as in security.py
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

try:
    print("Testing Argon2 Hashing...")
    hash = pwd_context.hash("testpassword")
    print(f"✅ Hash generated: {hash[:20]}...")
    
    verify = pwd_context.verify("testpassword", hash)
    print(f"✅ Verification result: {verify}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
