from pydantic import BaseModel
from decimal import Decimal

class DashboardSummary(BaseModel):
    total_students: int
    total_staff: int
    total_payments: int
    pending_payments: int
    total_income: Decimal
    pending_amount: Decimal
