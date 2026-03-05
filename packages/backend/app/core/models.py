from __future__ import annotations

from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional


@dataclass
class Segmento:
    """Un registro equivalente a una fila de la tabla de coordenadas."""

    inicio: str
    fin: str
    rumbo: str = ""
    distancia: Optional[float] = None
    este: Optional[float] = None
    norte: Optional[float] = None
    observaciones: str = ""


@dataclass
class Lindero:
    idx: int
    inicial: str = ""
    final: str = ""
    descripcion: str = ""
    colindante: str = ""


@dataclass
class GeometrySnapshot:
    area_m2: Optional[float] = None
    perimetro_m: Optional[float] = None


@dataclass
class AppState:
    """Fuente única de verdad del estado de la aplicación."""

    version: str = "v8.2.3"
    datos_predio: Dict[str, str] = field(default_factory=dict)
    datos_profesional: Dict[str, str] = field(default_factory=dict)

    # Coordenadas
    segmentos: List[Segmento] = field(default_factory=list)

    # Linderos (por idx)
    linderos: Dict[int, Lindero] = field(default_factory=dict)

    # Resultados geométricos
    geometry: GeometrySnapshot = field(default_factory=GeometrySnapshot)

    ruta_imagen_plano: Optional[str] = None
    ruta_logo: Optional[str] = None

    def to_dict(self) -> dict:
        return asdict(self)
