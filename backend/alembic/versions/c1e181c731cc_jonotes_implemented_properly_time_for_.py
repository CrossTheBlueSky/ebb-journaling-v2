"""jonotes implemented properly. Time for Uauth

Revision ID: c1e181c731cc
Revises: c65d2d9c2a93
Create Date: 2024-08-22 14:21:56.494163

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c1e181c731cc'
down_revision: Union[str, None] = 'c65d2d9c2a93'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
