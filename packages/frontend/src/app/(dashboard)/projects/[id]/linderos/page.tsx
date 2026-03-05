"use client";

import { Route } from "lucide-react";

export default function LinderosPage() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
          <Route className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Linderos</h2>
          <p className="text-sm text-slate-500">
            Definicion de linderos, colindancias y agrupacion de segmentos.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
        <p className="text-sm text-slate-500">
          Editor de linderos en construccion. Aqui se asignaran los nombres de
          colindantes a cada segmento, se agruparan segmentos en linderos
          (Norte, Sur, Este, Oeste) y se podra previsualizar la descripcion
          tecnica de cada lindero.
        </p>
      </div>
    </div>
  );
}
