"""joined mood colors with user entries query. beautiful!

Revision ID: c65d2d9c2a93
Revises: 815203dc0c09
Create Date: 2024-08-20 20:56:02.589471

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c65d2d9c2a93'
down_revision: Union[str, None] = '815203dc0c09'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
