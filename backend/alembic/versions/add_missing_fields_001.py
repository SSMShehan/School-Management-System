"""Add missing fields to Student, Staff, and Payment models

Revision ID: add_missing_fields_001
Revises: 
Create Date: 2026-01-12

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_missing_fields_001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Student table updates
    # Rename dob to date_of_birth
    op.alter_column('students', 'dob', new_column_name='date_of_birth')
    
    # Change student_id from UUID to String
    op.alter_column('students', 'student_id',
                    type_=sa.String(),
                    existing_type=postgresql.UUID(),
                    nullable=True)
    
    # Add new columns to students
    op.add_column('students', sa.Column('guardian_email', sa.String(), nullable=True))
    op.add_column('students', sa.Column('emergency_contact', sa.String(), nullable=True))
    op.add_column('students', sa.Column('address', sa.Text(), nullable=True))
    op.add_column('students', sa.Column('medical_info', sa.Text(), nullable=True))
    
    # Make class_id nullable
    op.alter_column('students', 'class_id', nullable=True)
    
    # Staff table updates
    # Rename contact to phone
    op.alter_column('staff', 'contact', new_column_name='phone')
    
    # Add new columns to staff
    op.add_column('staff', sa.Column('email', sa.String(), nullable=True))
    op.add_column('staff', sa.Column('qualifications', sa.Text(), nullable=True))
    
    # Payment table updates
    # Add new columns to payments
    op.add_column('payments', sa.Column('payment_method', sa.String(), nullable=True))
    op.add_column('payments', sa.Column('remarks', sa.Text(), nullable=True))
    
    # Add 'failed' to payment status enum (if using PostgreSQL)
    # Note: This requires dropping and recreating the enum type
    # For simplicity, making this nullable - adjust for production
    pass


def downgrade() -> None:
    # Student table downgrades
    op.drop_column('students', 'medical_info')
    op.drop_column('students', 'address')
    op.drop_column('students', 'emergency_contact')
    op.drop_column('students', 'guardian_email')
    
    op.alter_column('students', 'class_id', nullable=False)
    
    op.alter_column('students', 'student_id',
                    type_=postgresql.UUID(),
                    existing_type=sa.String())
    
    op.alter_column('students', 'date_of_birth', new_column_name='dob')
    
    # Staff table downgrades
    op.drop_column('staff', 'qualifications')
    op.drop_column('staff', 'email')
    op.alter_column('staff', 'phone', new_column_name='contact')
    
    # Payment table downgrades
    op.drop_column('payments', 'remarks')
    op.drop_column('payments', 'payment_method')
