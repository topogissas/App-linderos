"use client";

import { FileText, User } from "lucide-react";
import { useProjectStore } from "@/store/projectStore";
import { DEPARTAMENTOS, DEPARTAMENTOS_MUNICIPIOS, PROFESIONES } from "@/lib/constants";
import { useCallback, useMemo } from "react";

function InputField({
  label, value, onChange, placeholder, type = "text", readOnly = false, className = "",
}: {
  label: string; value: string; onChange?: (v: string) => void;
  placeholder?: string; type?: string; readOnly?: boolean; className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition ${
          readOnly ? "bg-slate-100 text-slate-500 cursor-not-allowed" : "bg-white"
        }`}
      />
    </div>
  );
}

function SelectField({
  label, value, onChange, options, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition"
      >
        <option value="">{placeholder || "Seleccionar..."}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

export default function DatosPage() {
  const datosPredio = useProjectStore((s) => s.datosPredio);
  const datosProfesional = useProjectStore((s) => s.datosProfesional);
  const areaM2 = useProjectStore((s) => s.areaM2);
  const perimetroM = useProjectStore((s) => s.perimetroM);
  const updateField = useProjectStore((s) => s.updateField);

  const setPredio = useCallback(
    (key: string, value: string) => {
      updateField("datosPredio", { ...datosPredio, [key]: value });
    },
    [datosPredio, updateField]
  );

  const setProf = useCallback(
    (key: string, value: string) => {
      updateField("datosProfesional", { ...datosProfesional, [key]: value });
    },
    [datosProfesional, updateField]
  );

  const municipios = useMemo(() => {
    const depto = datosPredio.departamento || "";
    return depto ? DEPARTAMENTOS_MUNICIPIOS[depto] || [] : [];
  }, [datosPredio.departamento]);

  const p = (key: string) => datosPredio[key] || "";
  const pr = (key: string) => datosProfesional[key] || "";

  const formatNum = (n: number | null) => {
    if (n == null) return "—";
    return n.toLocaleString("es-CO", { maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-6">
      {/* DATOS DEL PREDIO */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Datos del Predio</h2>
            <p className="text-xs text-slate-500">Información general del inmueble</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InputField label="Código de Expediente" value={p("expediente")} onChange={(v) => setPredio("expediente", v)} placeholder="Ej: EXP-2026-001" />
          <InputField label="Propietario" value={p("propietario")} onChange={(v) => setPredio("propietario", v)} placeholder="Nombre completo" className="lg:col-span-2" />
          <InputField label="Cédula / NIT" value={p("cedula")} onChange={(v) => setPredio("cedula", v)} placeholder="Número de documento" />
          <SelectField label="Departamento" value={p("departamento")} onChange={(v) => { setPredio("departamento", v); setPredio("municipio", ""); }} options={DEPARTAMENTOS} />
          <SelectField label="Municipio" value={p("municipio")} onChange={(v) => setPredio("municipio", v)} options={municipios} placeholder={municipios.length ? "Seleccionar municipio..." : "Seleccione departamento primero"} />
          <InputField label="Vereda / Localidad" value={p("vereda")} onChange={(v) => setPredio("vereda", v)} placeholder="Nombre de la vereda" />
          <InputField label="Nombre del Predio" value={p("predio")} onChange={(v) => setPredio("predio", v)} placeholder="Nombre del predio" />
          <InputField label="Cédula Catastral" value={p("cedula_catastral")} onChange={(v) => setPredio("cedula_catastral", v)} placeholder="Número catastral" />
          <InputField label="Folio de Matrícula Inmobiliaria" value={p("folio_matricula")} onChange={(v) => setPredio("folio_matricula", v)} placeholder="Folio matrícula" />
          <InputField label="Área (m²)" value={areaM2 != null ? formatNum(areaM2) : "Sin calcular"} readOnly />
          <InputField label="Perímetro (m)" value={perimetroM != null ? formatNum(perimetroM) : "Sin calcular"} readOnly />
        </div>

        <div className="mt-4">
          <label className="block text-xs font-medium text-slate-600 mb-1">Objeto del Levantamiento</label>
          <textarea
            value={p("objeto")}
            onChange={(e) => setPredio("objeto", e.target.value)}
            placeholder="Describir el objeto del levantamiento topográfico..."
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition resize-none"
          />
        </div>
      </div>

      {/* DATOS DEL PROFESIONAL */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Datos del Profesional</h2>
            <p className="text-xs text-slate-500">Información del profesional responsable del levantamiento</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Nombre del Profesional" value={pr("nombre_profesional")} onChange={(v) => setProf("nombre_profesional", v)} placeholder="Nombre completo" />
          <SelectField label="Profesión" value={pr("profesion")} onChange={(v) => setProf("profesion", v)} options={PROFESIONES} />
          <InputField label="Tarjeta Profesional No." value={pr("tarjeta_profesional")} onChange={(v) => setProf("tarjeta_profesional", v)} placeholder="Número de tarjeta" />
          <InputField label="Matrícula Profesional" value={pr("matricula")} onChange={(v) => setProf("matricula", v)} placeholder="Número de matrícula" />
        </div>
      </div>
    </div>
  );
}
