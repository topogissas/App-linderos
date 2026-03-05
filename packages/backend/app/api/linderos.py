"""Router de linderos: busqueda de secuencia de puntos entre dos vertices."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.db import crud
from app.db.models import User
from app.api.auth import get_current_user
from app.services.linderos_svc import (
    obtener_secuencia_puntos,
    calcular_distancia_total,
    calcular_rumbo_automatico,
)

router = APIRouter()


# ---------------------------------------------------------------------------
# Schemas de respuesta
# ---------------------------------------------------------------------------

class SequenceResponse(BaseModel):
    """Resultado de la busqueda de secuencia de puntos."""
    secuencia: list[str]
    distancia_total: float
    rumbo: str
    encontrado: bool


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get(
    "/projects/{project_id}/linderos/sequence",
    response_model=SequenceResponse,
    summary="Obtener secuencia de puntos entre dos vertices",
)
async def get_sequence(
    project_id: uuid.UUID,
    inicio: str = Query(..., description="Nombre del punto inicial"),
    fin: str = Query(..., description="Nombre del punto final"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Calcula la secuencia de puntos (camino mas corto por BFS) entre
    el punto ``inicio`` y el punto ``fin`` del poligono del proyecto.

    Retorna la lista de puntos ordenados, la distancia total acumulada
    y el rumbo general entre inicio y fin.

    El proyecto debe pertenecer al usuario autenticado.
    """
    # Verificar propiedad del proyecto
    project = await crud.get_project(db, project_id)
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado",
        )
    if project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para acceder a este proyecto",
        )

    segmentos = project.segmentos or []

    secuencia = obtener_secuencia_puntos(segmentos, inicio, fin)
    encontrado = len(secuencia) >= 2

    distancia = calcular_distancia_total(segmentos, secuencia) if encontrado else 0.0
    rumbo = calcular_rumbo_automatico(segmentos, inicio, fin) if encontrado else ""

    return SequenceResponse(
        secuencia=secuencia,
        distancia_total=distancia,
        rumbo=rumbo,
        encontrado=encontrado,
    )
