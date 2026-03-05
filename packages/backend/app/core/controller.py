from __future__ import annotations

from typing import Optional

from .events import EventBus
from .geometry import Indexes, build_indexes, polygon_area_perimeter
from .models import AppState, Segmento


class AppController:
    """Orquestador de estado.

    Etapa 1: centraliza la actualización de coordenadas y calcula un snapshot
    geométrico (área/perímetro) para que la UI no tenga que "adivinar".
    """

    def __init__(self, state: AppState, bus: Optional[EventBus] = None) -> None:
        self.state = state
        self.bus = bus or EventBus()
        self._indexes: Optional[Indexes] = None

    def set_segmentos(self, segmentos: list[Segmento]) -> None:
        self.state.segmentos = segmentos
        self._rebuild_indexes_and_geometry()
        self.bus.emit("coords.changed", {"count": len(segmentos)})

    def _rebuild_indexes_and_geometry(self) -> None:
        segs = [
            {
                "inicio": s.inicio,
                "fin": s.fin,
                "rumbo": s.rumbo,
                "distancia": s.distancia,
                "este": s.este,
                "norte": s.norte,
                "observaciones": s.observaciones,
            }
            for s in self.state.segmentos
        ]
        self._indexes = build_indexes(segs)

        # MVP: orden por aparición de 'inicio'
        ordered_pts = []
        seen = set()
        for s in self.state.segmentos:
            p = (s.inicio or "").strip()
            if p and p not in seen and p in self._indexes.point_xy:
                seen.add(p)
                ordered_pts.append(self._indexes.point_xy[p])

        area, per = polygon_area_perimeter(ordered_pts)
        self.state.geometry.area_m2 = area
        self.state.geometry.perimetro_m = per
        self.bus.emit("geometry.changed", {"area_m2": area, "perimetro_m": per})

    def get_point_xy(self, point: str) -> Optional[tuple[float, float]]:
        if self._indexes is None:
            self._rebuild_indexes_and_geometry()
        return self._indexes.point_xy.get(point.strip()) if self._indexes else None

    def get_edge_dist(self, a: str, b: str) -> Optional[float]:
        if self._indexes is None:
            self._rebuild_indexes_and_geometry()
        return self._indexes.edge_dist.get((a.strip(), b.strip())) if self._indexes else None
