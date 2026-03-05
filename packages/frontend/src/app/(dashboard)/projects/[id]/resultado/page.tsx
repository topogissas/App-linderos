"use client";

import { FileOutput } from "lucide-react";

export default function ResultadoPage() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
          <FileOutput className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Resultado</h2>
          <p className="text-sm text-slate-500">
            Descripcion tecnica generada lista para uso profesional.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
        <p className="text-sm text-slate-500">
          Vista de resultado en construccion. Aqui se mostrara la descripcion
          tecnica completa generada automaticamente, con opciones para copiar al
          portapapeles, exportar a PDF, y personalizar el formato del texto
          (rumbos astronomicos / magneticos, precision decimal, etc.).
        </p>
      </div>
    </div>
  );
}
