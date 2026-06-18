import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

# Get database URL from environment
db_url = os.getenv("DATABASE_URL")

# Parse the database URL
# Format: postgresql://user:password@host/database
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

# Check if branch_id column exists
cursor.execute("""
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name='users' AND column_name='branch_id';
""")

result = cursor.fetchone()

if not result:
    print("Adding branch_id column to users table...")
    cursor.execute("""
        ALTER TABLE users 
        ADD COLUMN branch_id UUID REFERENCES branches(branch_id);
    """)
    conn.commit()
    print("[SUCCESS] Successfully added branch_id column!")

else:
    print("[SUCCESS] branch_id column already exists")

cursor.close()
conn.close()
