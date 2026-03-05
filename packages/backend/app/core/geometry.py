from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple
import math


def parse_float(value: object) -> Optional[float]:
    """Parseo robusto para números que pueden venir formateados.

    Acepta:
    - 4682986.34
    - 4,682,986.34
    - 4682986,34
    - "4'682'986,34" (casos con apostrofe)

    Devuelve float o None.
    """

    if value is None:
        return None
    txt = str(value).strip().replace("'", "").replace(" ", "")
    if not txt:
        return None

    # Si hay coma y punto: asumir coma como separador de miles
    if "," in txt and "." in txt:
        txt = txt.replace(",", "")
    # Si solo hay coma: es decimal
    elif "," in txt and "." not in txt:
        txt = txt.replace(",", ".")

    try:
        return float(txt)
    except Exception:
        return None


@dataclass(frozen=True)
class Indexes:
    point_xy: Dict[str, Tuple[float, float]]
    edge_dist: Dict[Tuple[str, str], float]


def build_indexes(segmentos: List[dict]) -> Indexes:
    """Construye índices rápidos desde la lista de segmentos."""
    point_xy: Dict[str, Tuple[float, float]] = {}
    edge_dist: Dict[Tuple[str, str], float] = {}

    # 1) Índice de puntos
    for seg in segmentos:
        ini = str(seg.get("inicio", "")).strip()
        fin = str(seg.get("fin", "")).strip()
        x = parse_float(seg.get("este"))
        y = parse_float(seg.get("norte"))
        if ini and x is not None and y is not None and ini not in point_xy:
            point_xy[ini] = (float(x), float(y))

        d = parse_float(seg.get("distancia"))
        if ini and fin and d is not None:
            edge_dist[(ini, fin)] = float(d)
            edge_dist[(fin, ini)] = float(d)

    return Indexes(point_xy=point_xy, edge_dist=edge_dist)


def polygon_area_perimeter(points_in_order: List[Tuple[float, float]]) -> tuple[Optional[float], Optional[float]]:
    """Área (shoelace) y perímetro. Retorna (None,None) si no es polígono válido."""
    if len(points_in_order) < 3:
        return None, None

    n = len(points_in_order)
    area2 = 0.0
    per = 0.0
    for i in range(n):
        j = (i + 1) % n
        x1, y1 = points_in_order[i]
        x2, y2 = points_in_order[j]
        area2 += x1 * y2 - x2 * y1
        per += math.hypot(x2 - x1, y2 - y1)

    area = abs(area2) / 2.0
    return (area if area > 0 else None), (per if per > 0 else None)
