"""uauth implemented

Revision ID: d82991477c0f
Revises: c1e181c731cc
Create Date: 2024-08-22 16:10:49.505977

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd82991477c0f'
down_revision: Union[str, None] = 'c1e181c731cc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
