"""Operaciones CRUD para la base de datos (async SQLAlchemy)."""

from __future__ import annotations

import uuid
from typing import Any, Sequence

from sqlalchemy import select, delete as sa_delete
from sqlalchemy.ext.asyncio import AsyncSession

from .models import User, Project


# ---------------------------------------------------------------------------
# Usuarios
# ---------------------------------------------------------------------------

async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    """Obtiene un usuario por su email."""
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
    """Obtiene un usuario por su ID."""
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def create_user(db: AsyncSession, user_data: dict[str, Any]) -> User:
    """Crea un nuevo usuario en la base de datos.

    ``user_data`` debe contener al menos ``email`` y ``password_hash``.
    """
    user = User(**user_data)
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


# ---------------------------------------------------------------------------
# Proyectos
# ---------------------------------------------------------------------------

async def get_projects_by_user(
    db: AsyncSession,
    user_id: uuid.UUID,
) -> Sequence[Project]:
    """Lista todos los proyectos de un usuario, ordenados por fecha de
    actualizacion descendente."""
    result = await db.execute(
        select(Project)
        .where(Project.user_id == user_id)
        .order_by(Project.updated_at.desc())
    )
    return result.scalars().all()


async def get_project(db: AsyncSession, project_id: uuid.UUID) -> Project | None:
    """Obtiene un proyecto por su ID."""
    result = await db.execute(select(Project).where(Project.id == project_id))
    return result.scalar_one_or_none()


async def create_project(
    db: AsyncSession,
    user_id: uuid.UUID,
    data: dict[str, Any],
) -> Project:
    """Crea un nuevo proyecto asignado a un usuario."""
    project = Project(user_id=user_id, **data)
    db.add(project)
    await db.flush()
    await db.refresh(project)
    return project


async def update_project(
    db: AsyncSession,
    project_id: uuid.UUID,
    data: dict[str, Any],
) -> Project | None:
    """Actualiza los campos indicados de un proyecto (partial update).

    Solo actualiza las claves presentes en ``data`` cuyo valor no sea None.
    Retorna el proyecto actualizado o None si no existe.
    """
    project = await get_project(db, project_id)
    if project is None:
        return None

    for key, value in data.items():
        if value is not None and hasattr(project, key):
            setattr(project, key, value)

    await db.flush()
    await db.refresh(project)
    return project


async def delete_project(db: AsyncSession, project_id: uuid.UUID) -> bool:
    """Elimina un proyecto. Retorna True si se elimino, False si no existia."""
    result = await db.execute(
        sa_delete(Project).where(Project.id == project_id)
    )
    return result.rowcount > 0
