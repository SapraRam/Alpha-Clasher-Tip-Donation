"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-03-09

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "streamers",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("display_name", sa.String(length=128), nullable=False),
        sa.Column("overlay_token_hash", sa.String(length=128), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "donations",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("streamer_id", sa.String(length=64), nullable=False),
        sa.Column("name", sa.String(length=64), nullable=True),
        sa.Column("amount", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("amount_paise", sa.Integer(), nullable=False),
        sa.Column("meme_url", sa.Text(), nullable=False),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("voice_url", sa.Text(), nullable=True),
        sa.Column(
            "status",
            sa.Enum("pending", "confirmed", "expired", "failed", name="donationstatus"),
            nullable=False,
        ),
        sa.Column("transaction_id", sa.String(length=64), nullable=True),
        sa.Column("payment_link_id", sa.String(length=64), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["streamer_id"], ["streamers.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("payment_link_id"),
        sa.UniqueConstraint("transaction_id"),
    )
    op.create_index(
        "ix_donations_streamer_created", "donations", ["streamer_id", "created_at"], unique=False
    )
    op.create_index(
        "ix_donations_status_created", "donations", ["status", "created_at"], unique=False
    )


def downgrade() -> None:
    op.drop_index("ix_donations_status_created", table_name="donations")
    op.drop_index("ix_donations_streamer_created", table_name="donations")
    op.drop_table("donations")
    op.drop_table("streamers")
    op.execute("DROP TYPE IF EXISTS donationstatus")
