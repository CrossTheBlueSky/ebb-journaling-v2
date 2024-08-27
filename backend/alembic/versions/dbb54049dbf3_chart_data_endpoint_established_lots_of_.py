"""chart data endpoint established, lots of bug fixing for jwt, and some endpoints updated

Revision ID: dbb54049dbf3
Revises: 8e356ab04432
Create Date: 2024-08-27 12:33:55.761157

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'dbb54049dbf3'
down_revision: Union[str, None] = '8e356ab04432'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
