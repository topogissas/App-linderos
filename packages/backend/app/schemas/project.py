"""Schemas Pydantic para proyectos."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ProjectCreate(BaseModel):
    title: str = Field(default="Nuevo Proyecto", max_length=255)


class ProjectUpdate(BaseModel):
    """Actualización parcial del proyecto (auto-save)."""
    title: str | None = None
    datos_predio: dict[str, Any] | None = None
    datos_profesional: dict[str, Any] | None = None
    crs_config: dict[str, Any] | None = None
    segmentos: list[dict[str, Any]] | None = None
    linderos: dict[str, Any] | None = None
    rumbos_asignados: dict[str, list[int]] | None = None
    acta_data: dict[str, Any] | None = None
    area_m2: float | None = None
    perimetro_m: float | None = None


class ProjectResponse(BaseModel):
    id: str
    title: str
    datos_predio: dict[str, Any]
    datos_profesional: dict[str, Any]
    crs_config: dict[str, Any]
    segmentos: list[dict[str, Any]]
    linderos: dict[str, Any]
    rumbos_asignados: dict[str, list[int]]
    acta_data: dict[str, Any]
    area_m2: float | None = None
    perimetro_m: float | None = None
    schema_version: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProjectListItem(BaseModel):
    id: str
    title: str
    area_m2: float | None = None
    perimetro_m: float | None = None
    updated_at: datetime

    model_config = {"from_attributes": True}
