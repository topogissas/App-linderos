"""Servicio de coordenadas: calculo de rumbos, area y perimetro.

Contiene logica pura sin dependencias de base de datos ni frameworks.
"""

from __future__ import annotations

import math
from typing import Any

from app.core.geometry import build_indexes, parse_float, polygon_area_perimeter


# ---------------------------------------------------------------------------
# Calculo de rumbo por coordenadas
# ---------------------------------------------------------------------------

def calcular_rumbo_por_coords(x1: float, y1: float, x2: float, y2: float) -> str:
    """Calcula el rumbo (bearing cardinal) entre dos puntos dados en
    coordenadas planas (Este, Norte).

    Retorna una cadena como ``N 45\u00b030'20\" E`` en formato
    topografico colombiano.

    Parametros:
        x1, y1: coordenadas Este y Norte del punto de origen.
        x2, y2: coordenadas Este y Norte del punto de destino.
    """
    dx = x2 - x1
    dy = y2 - y1

    if dx == 0 and dy == 0:
        return ""

    # Angulo azimutal (0 = Norte, sentido horario)
    azimut_rad = math.atan2(dx, dy)
    azimut_deg = math.degrees(azimut_rad)

    if azimut_deg < 0:
        azimut_deg += 360.0

    # Convertir azimut a rumbo cardinal (cuadrante)
    if 0 <= azimut_deg < 90:
        # Cuadrante NE
        prefijo = "N"
        sufijo = "E"
        angulo = azimut_deg
    elif 90 <= azimut_deg < 180:
        # Cuadrante SE
        prefijo = "S"
        sufijo = "E"
        angulo = 180 - azimut_deg
    elif 180 <= azimut_deg < 270:
        # Cuadrante SW
        prefijo = "S"
        sufijo = "W"
        angulo = azimut_deg - 180
    else:
        # Cuadrante NW
        prefijo = "N"
        sufijo = "W"
        angulo = 360 - azimut_deg

    # Descomponer en grados, minutos, segundos
    grados = int(angulo)
    resto = (angulo - grados) * 60
    minutos = int(resto)
    segundos = round((resto - minutos) * 60, 1)

    # Formatear sin decimales en segundos si es entero
    if segundos == int(segundos):
        seg_str = f"{int(segundos)}\""
    else:
        seg_str = f"{segundos}\""

    return f"{prefijo} {grados}\u00b0{minutos}'{seg_str} {sufijo}"


# ---------------------------------------------------------------------------
# Calculo principal
# ---------------------------------------------------------------------------

def calcular_rumbos_y_area(segmentos: list[dict[str, Any]]) -> dict[str, Any]:
    """Recalcula rumbos por coordenadas, area y perimetro para una lista de
    segmentos.

    Para cada segmento que tenga coordenadas de inicio y fin, se calcula
    automaticamente el rumbo. Tambien se calcula el area (Gauss/shoelace) y
    el perimetro del poligono.

    Retorna un diccionario con:
        - ``segmentos``: la lista de segmentos actualizada con rumbos.
        - ``area_m2``: area en metros cuadrados.
        - ``perimetro_m``: perimetro en metros.
    """
    indexes = build_indexes(segmentos)
    point_xy = indexes.point_xy

    # Recalcular rumbo y distancia para cada segmento
    updated: list[dict[str, Any]] = []
    for seg in segmentos:
        seg_copy = dict(seg)
        ini = str(seg.get("inicio", "")).strip()
        fin = str(seg.get("fin", "")).strip()

        if ini in point_xy and fin in point_xy:
            x1, y1 = point_xy[ini]
            x2, y2 = point_xy[fin]
            seg_copy["rumbo"] = calcular_rumbo_por_coords(x1, y1, x2, y2)

            # Recalcular distancia si ambos puntos existen
            dist = math.hypot(x2 - x1, y2 - y1)
            seg_copy["distancia"] = round(dist, 4)

        updated.append(seg_copy)

    # Calcular area y perimetro
    ordered_points: list[tuple[float, float]] = []
    seen: set[str] = set()
    for seg in segmentos:
        p = str(seg.get("inicio", "")).strip()
        if p and p not in seen and p in point_xy:
            seen.add(p)
            ordered_points.append(point_xy[p])

    area, perimetro = polygon_area_perimeter(ordered_points)

    return {
        "segmentos": updated,
        "area_m2": round(area, 4) if area else None,
        "perimetro_m": round(perimetro, 4) if perimetro else None,
    }


# ---------------------------------------------------------------------------
# Catalogo de CRS (sistemas de referencia colombianos)
# ---------------------------------------------------------------------------

CRS_CATALOG = [
    {
        "code": "EPSG:3116",
        "name": "MAGNA-SIRGAS / Colombia Bogota zone",
        "origin": "Bogota",
        "description": "Origen Bogota (N: 1'000.000, E: 1'000.000)",
    },
    {
        "code": "EPSG:3114",
        "name": "MAGNA-SIRGAS / Colombia Far West zone",
        "origin": "Oeste Extremo",
        "description": "Origen Oeste Extremo (N: 1'000.000, E: 1'000.000)",
    },
    {
        "code": "EPSG:3115",
        "name": "MAGNA-SIRGAS / Colombia West zone",
        "origin": "Oeste",
        "description": "Origen Oeste (N: 1'000.000, E: 1'000.000)",
    },
    {
        "code": "EPSG:3117",
        "name": "MAGNA-SIRGAS / Colombia East Central zone",
        "origin": "Este Central",
        "description": "Origen Este Central (N: 1'000.000, E: 1'000.000)",
    },
    {
        "code": "EPSG:3118",
        "name": "MAGNA-SIRGAS / Colombia East zone",
        "origin": "Este",
        "description": "Origen Este (N: 1'000.000, E: 1'000.000)",
    },
    {
        "code": "EPSG:9377",
        "name": "MAGNA-SIRGAS / Origen-Nacional",
        "origin": "Unico Nacional",
        "description": "Origen unico nacional (N: 2'000.000, E: 5'000.000)",
    },
]


def get_crs_catalog() -> list[dict[str, str]]:
    """Retorna el catalogo de sistemas de referencia colombianos."""
    return CRS_CATALOG
