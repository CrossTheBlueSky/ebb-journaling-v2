"""entry forms handled

Revision ID: 209799663b47
Revises: 2decc075053e
Create Date: 2024-08-18 19:12:14.881601

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '209799663b47'
down_revision: Union[str, None] = '2decc075053e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
