"""image uploads handled

Revision ID: 8637a2ae1348
Revises: dbb54049dbf3
Create Date: 2024-08-29 17:19:56.953739

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8637a2ae1348'
down_revision: Union[str, None] = 'dbb54049dbf3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
