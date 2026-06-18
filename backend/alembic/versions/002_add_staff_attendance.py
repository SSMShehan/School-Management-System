"""Add staff attendance table

Revision ID: 002_add_staff_attendance
Revises: 001_add_multi_branch
Create Date: 2026-01-10

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002_add_staff_attendance'
down_revision = '001_add_multi_branch'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create staff_attendance_status enum type
    staff_attendance_status = postgresql.ENUM(
        'present', 'absent', 'late', 'half_day', 'on_leave',
        name='staffattendancestatus'
    )
    staff_attendance_status.create(op.get_bind())
    
    # Create staff_attendance table
    op.create_table(
        'staff_attendance',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('staff_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('staff.id'), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('status', sa.Enum('present', 'absent', 'late', 'half_day', 'on_leave', name='staffattendancestatus'), nullable=False),
        sa.Column('check_in_time', sa.Time(), nullable=True),
        sa.Column('check_out_time', sa.Time(), nullable=True),
        sa.Column('remarks', sa.String(), nullable=True),
        sa.Column('branch_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('branches.branch_id'), nullable=True),
    )
    
    # Create index on staff_id and date for faster lookups
    op.create_index('ix_staff_attendance_staff_id', 'staff_attendance', ['staff_id'])
    op.create_index('ix_staff_attendance_date', 'staff_attendance', ['date'])
    op.create_index('ix_staff_attendance_branch_id', 'staff_attendance', ['branch_id'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_staff_attendance_branch_id', table_name='staff_attendance')
    op.drop_index('ix_staff_attendance_date', table_name='staff_attendance')
    op.drop_index('ix_staff_attendance_staff_id', table_name='staff_attendance')
    
    # Drop table
    op.drop_table('staff_attendance')
    
    # Drop enum type
    staff_attendance_status = postgresql.ENUM(
        'present', 'absent', 'late', 'half_day', 'on_leave',
        name='staffattendancestatus'
    )
    staff_attendance_status.drop(op.get_bind())
