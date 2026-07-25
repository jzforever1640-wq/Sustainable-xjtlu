"""add SDG tags to contents

Revision ID: 7d25a11c9b4e
Revises: 3eddd7185d58
Create Date: 2026-07-25 12:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "7d25a11c9b4e"
down_revision = "3eddd7185d58"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "contents",
        sa.Column(
            "sdg_tags",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
    )
    op.create_index(
        "ix_contents_sdg_tags",
        "contents",
        ["sdg_tags"],
        unique=False,
        postgresql_using="gin",
    )


def downgrade():
    op.drop_index("ix_contents_sdg_tags", table_name="contents")
    op.drop_column("contents", "sdg_tags")
