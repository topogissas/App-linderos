"""Operaciones CRUD para la base de datos (async SQLAlchemy)."""

from __future__ import annotations

from typing import Any, Sequence

from sqlalchemy import select, delete as sa_delete
from sqlalchemy.ext.asyncio import AsyncSession

from .models import User, Project


# ---------------------------------------------------------------------------
# Usuarios
# ---------------------------------------------------------------------------

async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: str) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def create_user(db: AsyncSession, user_data: dict[str, Any]) -> User:
    user = User(**user_data)
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


# ---------------------------------------------------------------------------
# Proyectos
# ---------------------------------------------------------------------------

async def get_projects_by_user(db: AsyncSession, user_id: str) -> Sequence[Project]:
    result = await db.execute(
        select(Project)
        .where(Project.user_id == user_id)
        .order_by(Project.updated_at.desc())
    )
    return result.scalars().all()


async def get_project(db: AsyncSession, project_id: str) -> Project | None:
    result = await db.execute(select(Project).where(Project.id == project_id))
    return result.scalar_one_or_none()


async def create_project(db: AsyncSession, user_id: str, data: dict[str, Any]) -> Project:
    project = Project(user_id=user_id, **data)
    db.add(project)
    await db.flush()
    await db.refresh(project)
    return project


async def update_project(db: AsyncSession, project_id: str, data: dict[str, Any]) -> Project | None:
    project = await get_project(db, project_id)
    if project is None:
        return None

    for key, value in data.items():
        if value is not None and hasattr(project, key):
            setattr(project, key, value)

    await db.flush()
    await db.refresh(project)
    return project


async def delete_project(db: AsyncSession, project_id: str) -> bool:
    result = await db.execute(
        sa_delete(Project).where(Project.id == project_id)
    )
    return result.rowcount > 0
