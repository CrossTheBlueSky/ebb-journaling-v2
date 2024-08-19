"""monthly GETs working

Revision ID: 815203dc0c09
Revises: 209799663b47
Create Date: 2024-08-18 21:54:00.170322

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '815203dc0c09'
down_revision: Union[str, None] = '209799663b47'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
