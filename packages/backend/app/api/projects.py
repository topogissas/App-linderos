"""Router de proyectos: CRUD completo con verificacion de propiedad."""

from __future__ import annotations

import json
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.db import crud
from app.db.models import User
from app.api.auth import get_current_user
from app.schemas.project import (
    ProjectCreate,
    ProjectListItem,
    ProjectResponse,
    ProjectUpdate,
)

router = APIRouter()


# ---------------------------------------------------------------------------
# Helpers internos
# ---------------------------------------------------------------------------

async def _get_project_or_404(
    db: AsyncSession,
    project_id: uuid.UUID,
    user: User,
):
    """Obtiene un proyecto verificando que exista y que pertenezca al usuario.

    Lanza 404 si no existe y 403 si no es el propietario.
    """
    project = await crud.get_project(db, project_id)
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado",
        )
    if project.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para acceder a este proyecto",
        )
    return project


def _project_to_response(project) -> ProjectResponse:
    """Convierte un modelo SQLAlchemy Project a ProjectResponse."""
    return ProjectResponse(
        id=str(project.id),
        title=project.title,
        datos_predio=project.datos_predio or {},
        datos_profesional=project.datos_profesional or {},
        crs_config=project.crs_config or {},
        segmentos=project.segmentos or [],
        linderos=project.linderos or {},
        rumbos_asignados=project.rumbos_asignados or {
            "NORTE": [], "ESTE": [], "SUR": [], "OESTE": []
        },
        acta_data=project.acta_data or {},
        area_m2=project.area_m2,
        perimetro_m=project.perimetro_m,
        schema_version=project.schema_version or "3.0",
        created_at=project.created_at,
        updated_at=project.updated_at,
    )


def _project_to_list_item(project) -> ProjectListItem:
    """Convierte un modelo SQLAlchemy Project a ProjectListItem."""
    return ProjectListItem(
        id=str(project.id),
        title=project.title,
        area_m2=project.area_m2,
        perimetro_m=project.perimetro_m,
        updated_at=project.updated_at,
    )


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get(
    "/",
    response_model=list[ProjectListItem],
    summary="Listar proyectos del usuario",
)
async def list_projects(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retorna todos los proyectos del usuario autenticado."""
    projects = await crud.get_projects_by_user(db, current_user.id)
    return [_project_to_list_item(p) for p in projects]


@router.post(
    "/",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear un nuevo proyecto",
)
async def create_project(
    body: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Crea un proyecto vacio con el titulo proporcionado."""
    project = await crud.create_project(
        db,
        current_user.id,
        {"title": body.title},
    )
    return _project_to_response(project)


@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
    summary="Obtener un proyecto completo",
)
async def get_project(
    project_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retorna todos los datos de un proyecto. Requiere ser propietario."""
    project = await _get_project_or_404(db, project_id, current_user)
    return _project_to_response(project)


@router.put(
    "/{project_id}",
    response_model=ProjectResponse,
    summary="Actualizar proyecto (auto-save parcial)",
)
async def update_project(
    project_id: uuid.UUID,
    body: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Actualiza los campos enviados del proyecto. Ideal para auto-save."""
    await _get_project_or_404(db, project_id, current_user)

    data = body.model_dump(exclude_unset=True)
    project = await crud.update_project(db, project_id, data)
    return _project_to_response(project)


@router.delete(
    "/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar un proyecto",
)
async def delete_project(
    project_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Elimina permanentemente un proyecto. Requiere ser propietario."""
    await _get_project_or_404(db, project_id, current_user)
    await crud.delete_project(db, project_id)


@router.post(
    "/import",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Importar proyecto desde archivo .topogis.json",
)
async def import_project(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Importa un proyecto desde un archivo .topogis.json generado por la app
    de escritorio.

    El archivo debe ser un JSON valido con la estructura del estado de la
    aplicacion (AppState).
    """
    if not file.filename or not file.filename.endswith(".json"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo debe tener extension .json",
        )

    try:
        content = await file.read()
        data = json.loads(content)
    except (json.JSONDecodeError, UnicodeDecodeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo no contiene JSON valido",
        )

    # Extraer campos del formato de la app de escritorio
    project_data = {
        "title": data.get("datos_predio", {}).get("nombre_predio", "Proyecto Importado"),
        "datos_predio": data.get("datos_predio", {}),
        "datos_profesional": data.get("datos_profesional", {}),
        "segmentos": data.get("segmentos", []),
        "linderos": data.get("linderos", {}),
        "rumbos_asignados": data.get("rumbos_asignados", {
            "NORTE": [], "ESTE": [], "SUR": [], "OESTE": []
        }),
        "acta_data": data.get("acta_data", {}),
        "area_m2": data.get("geometry", {}).get("area_m2"),
        "perimetro_m": data.get("geometry", {}).get("perimetro_m"),
        "schema_version": data.get("version", "3.0"),
    }

    project = await crud.create_project(db, current_user.id, project_data)
    return _project_to_response(project)
