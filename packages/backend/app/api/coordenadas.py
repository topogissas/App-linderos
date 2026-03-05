"""Router de coordenadas: recalculo de rumbos, area/perimetro y catalogo CRS."""

from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.db import crud
from app.db.models import User
from app.api.auth import get_current_user
from app.services.coordenadas_svc import calcular_rumbos_y_area, get_crs_catalog

router = APIRouter()


# ---------------------------------------------------------------------------
# Schemas especificos de este router
# ---------------------------------------------------------------------------

class CalculateRequest(BaseModel):
    """Solicitud para recalcular rumbos y geometria."""
    segmentos: list[dict[str, Any]] = Field(
        ..., description="Lista de segmentos con coordenadas"
    )


class CalculateResponse(BaseModel):
    """Resultado del calculo de rumbos y geometria."""
    segmentos: list[dict[str, Any]]
    area_m2: float | None = None
    perimetro_m: float | None = None


class CRSItem(BaseModel):
    """Sistema de referencia de coordenadas."""
    code: str
    name: str
    origin: str
    description: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post(
    "/projects/{project_id}/coordenadas/calculate",
    response_model=CalculateResponse,
    summary="Recalcular rumbos, area y perimetro",
)
async def calculate_coordinates(
    project_id: uuid.UUID,
    body: CalculateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Recibe la lista de segmentos, recalcula los rumbos por coordenadas,
    la distancia entre puntos, el area (Gauss) y el perimetro.

    Retorna los segmentos actualizados junto con area y perimetro.
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

    result = calcular_rumbos_y_area(body.segmentos)

    return CalculateResponse(
        segmentos=result["segmentos"],
        area_m2=result["area_m2"],
        perimetro_m=result["perimetro_m"],
    )


@router.get(
    "/crs/catalog",
    response_model=list[CRSItem],
    summary="Obtener catalogo de sistemas de referencia",
)
async def crs_catalog():
    """Retorna el catalogo de sistemas de referencia de coordenadas
    disponibles (sistemas colombianos MAGNA-SIRGAS).

    No requiere autenticacion.
    """
    return get_crs_catalog()
