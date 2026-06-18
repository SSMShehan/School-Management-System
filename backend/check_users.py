import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

# Get database URL from environment
db_url = os.getenv("DATABASE_URL")

# Parse the database URL
url_parts = db_url.replace("postgresql://", "").split("@")
user_pass = url_parts[0].split(":")
host_db = url_parts[1].split("/")

user = user_pass[0]
password = user_pass[1]
host = host_db[0]
database = host_db[1]

# Connect to PostgreSQL
conn = psycopg2.connect(
    dbname=database,
    user=user,
    password=password,
    host=host
)

cursor = conn.cursor()

# Check for existing users
cursor.execute("SELECT id, username, role, branch_id FROM users;")
users = cursor.fetchall()

print("\n=== Current Users in Database ===")
if users:
    for user in users:
        print(f"ID: {user[0]}")
        print(f"Username: {user[1]}")
        print(f"Role: {user[2]}")
        print(f"Branch ID: {user[3]}")
        print("-" * 40)
else:
    print("No users found in database!")

print(f"\nTotal users: {len(users)}")

cursor.close()
conn.close()
