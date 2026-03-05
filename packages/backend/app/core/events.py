from __future__ import annotations

from collections import defaultdict
from typing import Callable, Dict, List


class EventBus:
    """Bus de eventos ultra-ligero.

    Permite que el controlador "avise" a la UI que algo cambió.
    La UI se suscribe a eventos (p. ej. 'coords.changed') y refresca su vista.
    """

    def __init__(self) -> None:
        self._subs: Dict[str, List[Callable[[dict], None]]] = defaultdict(list)

    def subscribe(self, event_name: str, callback: Callable[[dict], None]) -> None:
        self._subs[event_name].append(callback)

    def emit(self, event_name: str, payload: dict | None = None) -> None:
        payload = payload or {}
        for cb in list(self._subs.get(event_name, [])):
            try:
                cb(payload)
            except Exception:
                # No dejar caer la app por un listener defectuoso
                continue
