"use client";

import { ClipboardList } from "lucide-react";

export default function ActaPage() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
          <ClipboardList className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Acta de Colindancia
          </h2>
          <p className="text-sm text-slate-500">
            Genera actas de colindancia con datos de los colindantes.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
        <p className="text-sm text-slate-500">
          Editor de actas de colindancia en construccion. Aqui se podran
          capturar los datos de cada colindante (nombre, domicilio, INE),
          generar el texto del acta en formato oficial, agregar firmas
          digitales y exportar a PDF listo para impresion y firma.
        </p>
      </div>
    </div>
  );
}
