"""Servicio de linderos: busqueda de secuencias de puntos entre dos vertices.

Implementa un algoritmo BFS sobre el grafo de segmentos para encontrar la
ruta mas corta (en numero de tramos) entre un punto inicial y uno final.
Logica portada desde la app de escritorio.
"""

from __future__ import annotations

import math
from collections import deque
from typing import Any

from app.core.geometry import build_indexes, parse_float


# ---------------------------------------------------------------------------
# Grafo de adyacencia
# ---------------------------------------------------------------------------

def _build_adjacency(segmentos: list[dict[str, Any]]) -> dict[str, list[str]]:
    """Construye un grafo de adyacencia bidireccional a partir de los
    segmentos.

    Cada segmento conecta su punto 'inicio' con su punto 'fin'.
    """
    adj: dict[str, list[str]] = {}
    for seg in segmentos:
        ini = str(seg.get("inicio", "")).strip()
        fin = str(seg.get("fin", "")).strip()
        if ini and fin:
            adj.setdefault(ini, []).append(fin)
            adj.setdefault(fin, []).append(ini)
    return adj


# ---------------------------------------------------------------------------
# BFS para secuencia de puntos
# ---------------------------------------------------------------------------

def obtener_secuencia_puntos(
    segmentos: list[dict[str, Any]],
    inicio: str,
    fin: str,
) -> list[str]:
    """Encuentra la secuencia de puntos (camino) desde ``inicio`` hasta
    ``fin`` recorriendo los tramos (segmentos) del poligono.

    Utiliza BFS (busqueda en amplitud) para obtener el camino mas corto
    en cantidad de tramos.

    Retorna una lista ordenada de nombres de punto, incluyendo inicio y fin.
    Retorna lista vacia si no existe camino.
    """
    inicio = inicio.strip()
    fin = fin.strip()

    if not inicio or not fin:
        return []

    if inicio == fin:
        return [inicio]

    adj = _build_adjacency(segmentos)

    if inicio not in adj or fin not in adj:
        return []

    # BFS
    visited: set[str] = {inicio}
    queue: deque[list[str]] = deque([[inicio]])

    while queue:
        path = queue.popleft()
        current = path[-1]

        for vecino in adj.get(current, []):
            if vecino == fin:
                return path + [vecino]
            if vecino not in visited:
                visited.add(vecino)
                queue.append(path + [vecino])

    return []


# ---------------------------------------------------------------------------
# Distancia total de una secuencia
# ---------------------------------------------------------------------------

def calcular_distancia_total(
    segmentos: list[dict[str, Any]],
    secuencia: list[str],
) -> float:
    """Calcula la distancia total recorrida a lo largo de una secuencia de
    puntos, sumando las distancias de los tramos consecutivos.

    Si un tramo no tiene distancia registrada pero tiene coordenadas, se
    calcula geometricamente.
    """
    if len(secuencia) < 2:
        return 0.0

    indexes = build_indexes(segmentos)
    total = 0.0

    for i in range(len(secuencia) - 1):
        a = secuencia[i]
        b = secuencia[i + 1]

        # Intentar usar la distancia del indice de aristas
        dist = indexes.edge_dist.get((a, b))
        if dist is not None:
            total += dist
            continue

        # Fallback: calcular por coordenadas
        pa = indexes.point_xy.get(a)
        pb = indexes.point_xy.get(b)
        if pa and pb:
            total += math.hypot(pb[0] - pa[0], pb[1] - pa[1])

    return round(total, 4)


# ---------------------------------------------------------------------------
# Rumbo automatico entre dos puntos
# ---------------------------------------------------------------------------

def calcular_rumbo_automatico(
    segmentos: list[dict[str, Any]],
    point_a: str,
    point_b: str,
) -> str:
    """Calcula el rumbo cardinal entre dos puntos nombrados, usando las
    coordenadas almacenadas en los segmentos.

    Retorna cadena vacia si alguno de los puntos no tiene coordenadas.
    """
    from app.services.coordenadas_svc import calcular_rumbo_por_coords

    indexes = build_indexes(segmentos)
    pa = indexes.point_xy.get(point_a.strip())
    pb = indexes.point_xy.get(point_b.strip())

    if pa is None or pb is None:
        return ""

    return calcular_rumbo_por_coords(pa[0], pa[1], pb[0], pb[1])
