"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { useProjectStore } from "@/store/projectStore";
import {
  ClipboardList,
  Download,
  Users,
  Building2,
  CalendarDays,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ActaFormData {
  fecha_acta: string;
  hora_acta: string;
  departamento_acta: string;
  municipio_acta: string;
  vereda_acta: string;
  fmi: string;
  numero_predial: string;
  direccion: string;
  telefono: string;
  correo: string;
  titulos: string;
}

interface Colindante {
  rumbo: string;
  nombre: string;
  documento: string;
  folio: string;
  telefono: string;
  firma: string;
}

interface Lindero {
  puntoInicial: string;
  puntoFinal: string;
  rumbo: string;
  distanciaTotal: number;
  colindante: string;
  tipoLinea: string;
  folio: string;
  cedula: string;
}

interface RumbosAsignados {
  NORTE: number[];
  ESTE: number[];
  SUR: number[];
  OESTE: number[];
}

/* ------------------------------------------------------------------ */
/*  Helper: get cardinal label for an index                            */
/* ------------------------------------------------------------------ */

function getCardinalLabel(
  idx: number,
  rumbos: RumbosAsignados
): string {
  const labels: string[] = [];
  if (rumbos.NORTE?.includes(idx)) labels.push("NORTE");
  if (rumbos.ESTE?.includes(idx)) labels.push("ESTE");
  if (rumbos.SUR?.includes(idx)) labels.push("SUR");
  if (rumbos.OESTE?.includes(idx)) labels.push("OESTE");
  return labels.join(", ") || "-";
}

/* ------------------------------------------------------------------ */
/*  Helper: build colindantes from linderos + rumbos                   */
/* ------------------------------------------------------------------ */

function buildColindantesFromLinderos(
  linderos: Lindero[],
  rumbos: RumbosAsignados
): Colindante[] {
  return linderos.map((l, idx) => ({
    rumbo: getCardinalLabel(idx, rumbos),
    nombre: l.colindante || "",
    documento: l.cedula || "",
    folio: l.folio || "",
    telefono: "",
    firma: "Pendiente",
  }));
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const BASE_URL =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    : "http://localhost:8000";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ActaPage() {
  const params = useParams<{ id: string }>();
  const datosPredio = useProjectStore((s) => s.datosPredio);
  const actaData = useProjectStore((s) => s.actaData);
  const linderos = useProjectStore((s) => s.linderos) as Lindero[];
  const rumbosAsignados = useProjectStore((s) => s.rumbosAsignados);
  const updateField = useProjectStore((s) => s.updateField);

  const [exportingDocx, setExportingDocx] = useState(false);

  /* ---- Rumbos ---- */
  const rumbos = useMemo<RumbosAsignados>(() => {
    const defaults: RumbosAsignados = {
      NORTE: [],
      ESTE: [],
      SUR: [],
      OESTE: [],
    };
    if (rumbosAsignados && typeof rumbosAsignados === "object") {
      const r = rumbosAsignados as Partial<RumbosAsignados>;
      return {
        NORTE: Array.isArray(r.NORTE) ? r.NORTE : [],
        ESTE: Array.isArray(r.ESTE) ? r.ESTE : [],
        SUR: Array.isArray(r.SUR) ? r.SUR : [],
        OESTE: Array.isArray(r.OESTE) ? r.OESTE : [],
      };
    }
    return defaults;
  }, [rumbosAsignados]);

  /* ---- Acta form data ---- */
  const formData = useMemo<ActaFormData>(() => {
    const a = actaData as Partial<ActaFormData>;
    return {
      fecha_acta: a.fecha_acta || "",
      hora_acta: a.hora_acta || "",
      departamento_acta:
        a.departamento_acta ||
        (datosPredio.departamento as string) ||
        "",
      municipio_acta:
        a.municipio_acta || (datosPredio.municipio as string) || "",
      vereda_acta:
        a.vereda_acta || (datosPredio.vereda as string) || "",
      fmi: a.fmi || (datosPredio.folio_matricula as string) || "",
      numero_predial:
        a.numero_predial ||
        (datosPredio.cedula_catastral as string) ||
        "",
      direccion: a.direccion || "",
      telefono: a.telefono || "",
      correo: a.correo || "",
      titulos: a.titulos || "",
    };
  }, [actaData, datosPredio]);

  /* ---- Colindantes table ---- */
  const [colindantes, setColindantes] = useState<Colindante[]>([]);

  // Initialize colindantes from linderos on first render
  useEffect(() => {
    const savedColindantes = (actaData as Record<string, unknown>)
      .colindantes as Colindante[] | undefined;
    if (Array.isArray(savedColindantes) && savedColindantes.length > 0) {
      setColindantes(savedColindantes);
    } else if (Array.isArray(linderos) && linderos.length > 0) {
      setColindantes(buildColindantesFromLinderos(linderos, rumbos));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- Persist changes to store ---- */
  const persistActa = useCallback(
    (updates: Partial<ActaFormData>, updatedColindantes?: Colindante[]) => {
      const newActa = {
        ...actaData,
        ...formData,
        ...updates,
        colindantes: updatedColindantes ?? colindantes,
      };
      updateField("actaData", newActa);
    },
    [actaData, formData, colindantes, updateField]
  );

  const handleFormChange = useCallback(
    (field: keyof ActaFormData, value: string) => {
      persistActa({ [field]: value });
    },
    [persistActa]
  );

  const handleColindanteChange = useCallback(
    (idx: number, field: keyof Colindante, value: string) => {
      const updated = colindantes.map((c, i) =>
        i === idx ? { ...c, [field]: value } : c
      );
      setColindantes(updated);
      persistActa({}, updated);
    },
    [colindantes, persistActa]
  );

  const handleAddColindante = useCallback(() => {
    const newRow: Colindante = {
      rumbo: "",
      nombre: "",
      documento: "",
      folio: "",
      telefono: "",
      firma: "Pendiente",
    };
    const updated = [...colindantes, newRow];
    setColindantes(updated);
    persistActa({}, updated);
  }, [colindantes, persistActa]);

  const handleRemoveColindante = useCallback(
    (idx: number) => {
      if (colindantes.length <= 1) return;
      const updated = colindantes.filter((_, i) => i !== idx);
      setColindantes(updated);
      persistActa({}, updated);
    },
    [colindantes, persistActa]
  );

  /* ---- Export ---- */
  const handleExportDocx = useCallback(async () => {
    if (!params.id) return;
    setExportingDocx(true);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      const res = await fetch(
        `${BASE_URL}/api/projects/${params.id}/documentos/acta-docx`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!res.ok) {
        throw new Error("Error al exportar el acta");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `acta_colindancia_${params.id}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export Acta DOCX error:", err);
      alert(
        "Error al exportar el acta. Verifique que el servidor este activo."
      );
    } finally {
      setExportingDocx(false);
    }
  }, [params.id]);

  /* ---------------------------------------------------------------- */
  /*  Shared input class                                               */
  /* ---------------------------------------------------------------- */
  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none";

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="space-y-6">
      {/* ---- Header ---- */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
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

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportDocx}
              disabled={exportingDocx}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              {exportingDocx ? "Exportando..." : "Exportar Acta DOCX"}
            </button>
            <button
              disabled
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-400 cursor-not-allowed"
              title="Proximamente"
            >
              <Download className="h-4 w-4" />
              Exportar Acta PDF
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                Pronto
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ---- Section 1: Datos de la Suscripcion ---- */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
            <CalendarDays className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700">
            Datos de la Suscripcion
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={formData.fecha_acta}
              onChange={(e) => handleFormChange("fecha_acta", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Hora
            </label>
            <input
              type="time"
              value={formData.hora_acta}
              onChange={(e) => handleFormChange("hora_acta", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Departamento
            </label>
            <input
              type="text"
              value={formData.departamento_acta}
              onChange={(e) =>
                handleFormChange("departamento_acta", e.target.value)
              }
              placeholder="Departamento"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Municipio
            </label>
            <input
              type="text"
              value={formData.municipio_acta}
              onChange={(e) =>
                handleFormChange("municipio_acta", e.target.value)
              }
              placeholder="Municipio"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Vereda
            </label>
            <input
              type="text"
              value={formData.vereda_acta}
              onChange={(e) =>
                handleFormChange("vereda_acta", e.target.value)
              }
              placeholder="Vereda"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* ---- Section 2: Datos del Predio Objeto ---- */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Building2 className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700">
            Datos del Predio Objeto
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Folio de Matricula Inmobiliaria
            </label>
            <input
              type="text"
              value={formData.fmi}
              onChange={(e) => handleFormChange("fmi", e.target.value)}
              placeholder="FMI"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Numero Predial
            </label>
            <input
              type="text"
              value={formData.numero_predial}
              onChange={(e) =>
                handleFormChange("numero_predial", e.target.value)
              }
              placeholder="Numero predial"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Direccion del Predio
            </label>
            <input
              type="text"
              value={formData.direccion}
              onChange={(e) => handleFormChange("direccion", e.target.value)}
              placeholder="Direccion"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Telefono de Contacto
            </label>
            <input
              type="text"
              value={formData.telefono}
              onChange={(e) => handleFormChange("telefono", e.target.value)}
              placeholder="Telefono"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Correo Electronico
            </label>
            <input
              type="email"
              value={formData.correo}
              onChange={(e) => handleFormChange("correo", e.target.value)}
              placeholder="correo@ejemplo.com"
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Titulos que acreditan la propiedad
            </label>
            <textarea
              value={formData.titulos}
              onChange={(e) => handleFormChange("titulos", e.target.value)}
              placeholder="Descripcion de los titulos de propiedad..."
              rows={3}
              className={inputCls + " resize-y"}
            />
          </div>
        </div>
      </div>

      {/* ---- Section 3: Tabla de Colindantes ---- */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Users className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700">
              Tabla de Colindantes
            </h3>
          </div>
          <button
            onClick={handleAddColindante}
            className="inline-flex items-center gap-1.5 rounded-lg border border-teal-300 px-3 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-50 transition-colors"
          >
            + Agregar Colindante
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-3 py-2.5 font-medium text-slate-600 w-10">
                  #
                </th>
                <th className="px-3 py-2.5 font-medium text-slate-600 min-w-[100px]">
                  Rumbo
                </th>
                <th className="px-3 py-2.5 font-medium text-slate-600 min-w-[170px]">
                  Nombre Colindante
                </th>
                <th className="px-3 py-2.5 font-medium text-slate-600 min-w-[130px]">
                  Documento
                </th>
                <th className="px-3 py-2.5 font-medium text-slate-600 min-w-[140px]">
                  Folio de Matricula
                </th>
                <th className="px-3 py-2.5 font-medium text-slate-600 min-w-[120px]">
                  Telefono
                </th>
                <th className="px-3 py-2.5 font-medium text-slate-600 min-w-[100px]">
                  Firma
                </th>
                <th className="px-3 py-2.5 font-medium text-slate-600 w-10">
                  {/* delete */}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {colindantes.length > 0 ? (
                colindantes.map((col, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-3 py-2 text-center font-semibold text-slate-500">
                      {idx + 1}
                    </td>

                    <td className="px-3 py-2">
                      <select
                        value={col.rumbo}
                        onChange={(e) =>
                          handleColindanteChange(idx, "rumbo", e.target.value)
                        }
                        className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                      >
                        <option value="">-- Rumbo --</option>
                        <option value="NORTE">NORTE</option>
                        <option value="ESTE">ESTE</option>
                        <option value="SUR">SUR</option>
                        <option value="OESTE">OESTE</option>
                        <option value="NORTE, ESTE">NORTE, ESTE</option>
                        <option value="NORTE, OESTE">NORTE, OESTE</option>
                        <option value="SUR, ESTE">SUR, ESTE</option>
                        <option value="SUR, OESTE">SUR, OESTE</option>
                      </select>
                    </td>

                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={col.nombre}
                        onChange={(e) =>
                          handleColindanteChange(
                            idx,
                            "nombre",
                            e.target.value
                          )
                        }
                        placeholder="Nombre completo"
                        className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                      />
                    </td>

                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={col.documento}
                        onChange={(e) =>
                          handleColindanteChange(
                            idx,
                            "documento",
                            e.target.value
                          )
                        }
                        placeholder="C.C."
                        className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                      />
                    </td>

                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={col.folio}
                        onChange={(e) =>
                          handleColindanteChange(
                            idx,
                            "folio",
                            e.target.value
                          )
                        }
                        placeholder="Folio"
                        className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                      />
                    </td>

                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={col.telefono}
                        onChange={(e) =>
                          handleColindanteChange(
                            idx,
                            "telefono",
                            e.target.value
                          )
                        }
                        placeholder="Telefono"
                        className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                      />
                    </td>

                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-medium text-amber-700">
                        {col.firma || "Pendiente"}
                      </span>
                    </td>

                    <td className="px-3 py-2">
                      <button
                        onClick={() => handleRemoveColindante(idx)}
                        disabled={colindantes.length <= 1}
                        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
                        title="Eliminar colindante"
                      >
                        X
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center">
                    <p className="text-sm text-slate-400">
                      No hay colindantes. Agregue uno manualmente o defina
                      linderos en la pestana correspondiente.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
