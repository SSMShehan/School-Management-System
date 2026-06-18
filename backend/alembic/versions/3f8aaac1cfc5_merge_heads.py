"""merge_heads

Revision ID: 3f8aaac1cfc5
Revises: 002_add_staff_attendance, add_missing_fields_001
Create Date: 2026-01-22 12:43:02.752261

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3f8aaac1cfc5'
down_revision: Union[str, Sequence[str], None] = ('002_add_staff_attendance', 'add_missing_fields_001')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
