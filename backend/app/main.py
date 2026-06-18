from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth, student, staff, payment, attendance, dashboard, fee_structure, reports, branch, staff_attendance
from .database import engine, Base

# Create tables automatically (for dev purposes, usually use Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="School Management System")

# CORS middleware - MUST be before route registration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development
    allow_credentials=False,  # Set to False when using wildcard
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(auth.router)
app.include_router(branch.router)
app.include_router(student.router)
app.include_router(staff.router)
app.include_router(payment.router)
app.include_router(attendance.router)
app.include_router(staff_attendance.router)
app.include_router(dashboard.router)
app.include_router(fee_structure.router)
app.include_router(reports.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the School Management System API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
