"""UD added, seed.py implemented, connection pools troubleshooted, sanity lost, dreams ruined

Revision ID: 8e356ab04432
Revises: d82991477c0f
Create Date: 2024-08-22 20:59:22.893602

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8e356ab04432'
down_revision: Union[str, None] = 'd82991477c0f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
