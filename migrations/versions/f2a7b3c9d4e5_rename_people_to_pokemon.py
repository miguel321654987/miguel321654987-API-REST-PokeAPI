"""rename people -> pokemon

Revision ID: f2a7b3c9d4e5
Revises: cd526402ec9f
Create Date: 2026-07-17 12:51:16.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f2a7b3c9d4e5'
down_revision = 'cd526402ec9f'
branch_labels = None
depends_on = None


def upgrade():
    # Rename the existing table 'people' to 'pokemon'
    op.rename_table('people', 'pokemon')


def downgrade():
    # Revert the table name back to 'people'
    op.rename_table('pokemon', 'people')


