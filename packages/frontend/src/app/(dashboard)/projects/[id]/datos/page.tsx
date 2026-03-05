"use client";

import { FileText } from "lucide-react";

export default function DatosPage() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Datos del Predio
          </h2>
          <p className="text-sm text-slate-500">
            Informacion general del predio y del profesionista responsable.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
        <p className="text-sm text-slate-500">
          Formulario de datos del predio en construccion. Aqui se capturaran los
          datos del propietario, ubicacion, superficie segun escritura, numero de
          escritura, y datos del profesionista responsable (nombre, cedula
          profesional, firma electronica).
        </p>
      </div>
    </div>
  );
}
