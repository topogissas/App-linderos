"use client";

import { MapPinned } from "lucide-react";

export default function CoordenadasPage() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
          <MapPinned className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Coordenadas</h2>
          <p className="text-sm text-slate-500">
            Captura de vertices del poligono en coordenadas UTM o geograficas.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
        <p className="text-sm text-slate-500">
          Editor de coordenadas en construccion. Aqui se podran capturar los
          vertices del poligono, importar desde CSV/Excel, seleccionar la zona
          UTM, visualizar en un mapa interactivo (Leaflet) y validar el cierre
          del poligono.
        </p>
      </div>
    </div>
  );
}
