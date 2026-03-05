"""Router de documentos: generacion de descripcion tecnica y exportacion DOCX."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import PlainTextResponse, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.db import crud
from app.db.models import User
from app.api.auth import get_current_user
from app.services.descripcion_svc import generar_descripcion_textual, generar_docx

router = APIRouter()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _project_to_dict(project) -> dict:
    """Convierte un modelo Project a diccionario para los servicios."""
    return {
        "title": project.title,
        "datos_predio": project.datos_predio or {},
        "datos_profesional": project.datos_profesional or {},
        "segmentos": project.segmentos or [],
        "linderos": project.linderos or {},
        "rumbos_asignados": project.rumbos_asignados or {
            "NORTE": [], "ESTE": [], "SUR": [], "OESTE": []
        },
        "acta_data": project.acta_data or {},
        "area_m2": project.area_m2,
        "perimetro_m": project.perimetro_m,
    }


async def _get_project_for_user(
    db: AsyncSession,
    project_id: uuid.UUID,
    user: User,
):
    """Obtiene el proyecto verificando existencia y propiedad."""
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


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post(
    "/projects/{project_id}/documentos/preview",
    response_class=PlainTextResponse,
    summary="Generar vista previa de la descripcion tecnica",
)
async def preview_description(
    project_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Genera la descripcion tecnica de linderos del predio en texto plano.

    Utiliza los segmentos, linderos y rumbos asignados del proyecto para
    construir la descripcion completa.
    """
    project = await _get_project_for_user(db, project_id, current_user)
    data = _project_to_dict(project)
    texto = generar_descripcion_textual(data)
    return PlainTextResponse(content=texto, media_type="text/plain; charset=utf-8")


@router.post(
    "/projects/{project_id}/documentos/docx",
    summary="Generar documento DOCX con la descripcion tecnica",
    responses={
        200: {
            "content": {
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {}
            },
            "description": "Archivo DOCX generado",
        }
    },
)
async def generate_docx(
    project_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Genera un archivo DOCX con la descripcion tecnica de linderos del
    predio, listo para descargar.
    """
    project = await _get_project_for_user(db, project_id, current_user)
    data = _project_to_dict(project)

    docx_bytes = generar_docx(data)

    # Nombre del archivo basado en el titulo del proyecto
    safe_title = (project.title or "proyecto").replace(" ", "_")[:50]
    filename = f"descripcion_tecnica_{safe_title}.docx"

    return Response(
        content=docx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )
