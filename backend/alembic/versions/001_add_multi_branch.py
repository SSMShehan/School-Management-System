"""Add multi-branch support

Revision ID: 001_add_multi_branch
Revises: 
Create Date: 2026-01-10

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers, used by Alembic.
revision = '001_add_multi_branch'
down_revision = None
branch_labels = None
depends_on = None

# Default branch ID to be used for existing records
DEFAULT_BRANCH_ID = uuid.UUID('00000000-0000-0000-0000-000000000001')


def upgrade() -> None:
    # Create branches table
    op.create_table(
        'branches',
        sa.Column('branch_id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('name', sa.String(), nullable=False, unique=True),
        sa.Column('location', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    
    # Insert default branch
    op.execute(f"""
        INSERT INTO branches (branch_id, name, location, is_active, created_at)
        VALUES ('{DEFAULT_BRANCH_ID}', 'Main Branch', 'Default Location', true, NOW())
    """)
    
    # Add branch_id column to students table
    op.add_column('students', sa.Column('branch_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key('fk_students_branch', 'students', 'branches', ['branch_id'], ['branch_id'])
    
    # Add branch_id column to staff table
    op.add_column('staff', sa.Column('branch_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key('fk_staff_branch', 'staff', 'branches', ['branch_id'], ['branch_id'])
    
    # Add branch_id column to classes table
    op.add_column('classes', sa.Column('branch_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key('fk_classes_branch', 'classes', 'branches', ['branch_id'], ['branch_id'])
    
    # Add branch_id column to payments table
    op.add_column('payments', sa.Column('branch_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key('fk_payments_branch', 'payments', 'branches', ['branch_id'], ['branch_id'])
    
    # Add branch_id column to users table
    op.add_column('users', sa.Column('branch_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key('fk_users_branch', 'users', 'branches', ['branch_id'], ['branch_id'])
    
    # Update existing records to use default branch
    op.execute(f"UPDATE students SET branch_id = '{DEFAULT_BRANCH_ID}' WHERE branch_id IS NULL")
    op.execute(f"UPDATE staff SET branch_id = '{DEFAULT_BRANCH_ID}' WHERE branch_id IS NULL")
    op.execute(f"UPDATE classes SET branch_id = '{DEFAULT_BRANCH_ID}' WHERE branch_id IS NULL")
    op.execute(f"UPDATE payments SET branch_id = '{DEFAULT_BRANCH_ID}' WHERE branch_id IS NULL")
    # Note: Users are intentionally left nullable - admin users have NULL branch_id


def downgrade() -> None:
    # Remove foreign keys first
    op.drop_constraint('fk_users_branch', 'users', type_='foreignkey')
    op.drop_constraint('fk_payments_branch', 'payments', type_='foreignkey')
    op.drop_constraint('fk_classes_branch', 'classes', type_='foreignkey')
    op.drop_constraint('fk_staff_branch', 'staff', type_='foreignkey')
    op.drop_constraint('fk_students_branch', 'students', type_='foreignkey')
    
    # Remove branch_id columns
    op.drop_column('users', 'branch_id')
    op.drop_column('payments', 'branch_id')
    op.drop_column('classes', 'branch_id')
    op.drop_column('staff', 'branch_id')
    op.drop_column('students', 'branch_id')
    
    # Drop branches table
    op.drop_table('branches')
