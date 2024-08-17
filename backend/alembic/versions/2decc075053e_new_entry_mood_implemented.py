"""New Entry/Mood implemented

Revision ID: 2decc075053e
Revises: ae8e21e25617
Create Date: 2024-08-17 15:29:21.018908

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2decc075053e'
down_revision: Union[str, None] = 'ae8e21e25617'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
