"use client";

import { useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { useProjectStore } from "@/store/projectStore";
import { cn } from "@/lib/utils";
import {
  FileOutput,
  FileText,
  Table,
  Copy,
  Check,
  Download,
  Sparkles,
  Clock,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

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
/*  Helper: determine cardinal direction label for a lindero index     */
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
/*  Helper: generate description text from store data                  */
/* ------------------------------------------------------------------ */

function generateDescription(
  datosPredio: Record<string, unknown>,
  datosProfesional: Record<string, unknown>,
  linderos: Lindero[],
  rumbos: RumbosAsignados,
  areaM2: number | null,
  perimetroM: number | null
): string {
  const val = (obj: Record<string, unknown>, key: string): string =>
    (obj[key] as string) || "___";

  const predio = val(datosPredio, "nombre_predio");
  const propietario = val(datosPredio, "propietario");
  const vereda = val(datosPredio, "vereda");
  const municipio = val(datosPredio, "municipio");
  const departamento = val(datosPredio, "departamento");
  const cedulaCatastral = val(datosPredio, "cedula_catastral");
  const folioMatricula = val(datosPredio, "folio_matricula");

  const nombreProfesional = val(datosProfesional, "nombre");
  const profesion = val(datosProfesional, "profesion");
  const tarjetaProfesional = val(datosProfesional, "tarjeta_profesional");

  const area = areaM2 != null ? areaM2.toFixed(2) : "___";
  const areaHa = areaM2 != null ? (areaM2 / 10000).toFixed(4) : "___";
  const perimetro = perimetroM != null ? perimetroM.toFixed(2) : "___";

  const firstPoint =
    linderos.length > 0 && linderos[0].puntoInicial
      ? linderos[0].puntoInicial
      : "___";

  let linderosText = "";
  linderos.forEach((l, idx) => {
    const cardinal = getCardinalLabel(idx, rumbos);
    linderosText += `${cardinal}: Del punto ${l.puntoInicial || "___"} al punto ${l.puntoFinal || "___"}, en direccion ${l.rumbo || "___"}, con una distancia de ${l.distanciaTotal.toFixed(2)} metros, por linea ${l.tipoLinea || "Recta"}, colinda con ${l.colindante || "___"}.${l.folio ? ` (Folio: ${l.folio})` : ""}\n\n`;
  });

  return `DESCRIPCION TECNICA DEL PREDIO

Predio: ${predio}
Propietario: ${propietario}
Ubicacion: Vereda ${vereda}, Municipio de ${municipio}, Departamento de ${departamento}
Cedula Catastral: ${cedulaCatastral}
Folio de Matricula: ${folioMatricula}

DESCRIPCION DE LINDEROS:

PARTIENDO del punto ${firstPoint}, se describen los siguientes linderos:

${linderosText}CIERRE: Desde el ultimo punto descrito hasta llegar al punto de partida ${firstPoint}, cerrando el poligono del predio.

Area total del predio: ${area} metros cuadrados (${areaHa} hectareas)
Perimetro total: ${perimetro} metros

Profesional responsable: ${nombreProfesional}
${profesion} - T.P. No. ${tarjetaProfesional}
`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

type SubTab = "descripcion" | "tabla";

const BASE_URL =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    : "http://localhost:8000";

export default function ResultadoPage() {
  const params = useParams<{ id: string }>();
  const datosPredio = useProjectStore((s) => s.datosPredio);
  const datosProfesional = useProjectStore((s) => s.datosProfesional);
  const linderos = useProjectStore((s) => s.linderos) as Lindero[];
  const rumbosAsignados = useProjectStore((s) => s.rumbosAsignados);
  const areaM2 = useProjectStore((s) => s.areaM2);
  const perimetroM = useProjectStore((s) => s.perimetroM);

  const [activeTab, setActiveTab] = useState<SubTab>("descripcion");
  const [generatedText, setGeneratedText] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportingDocx, setExportingDocx] = useState(false);

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

  const currentLinderos = useMemo<Lindero[]>(() => {
    if (Array.isArray(linderos) && linderos.length > 0) {
      return linderos;
    }
    return [];
  }, [linderos]);

  /* ---- Actions ---- */

  const handleGenerate = useCallback(() => {
    setIsGenerating(true);
    // Simulate a brief delay for UX feedback, then generate locally
    setTimeout(() => {
      const text = generateDescription(
        datosPredio,
        datosProfesional,
        currentLinderos,
        rumbos,
        areaM2,
        perimetroM
      );
      setGeneratedText(text);
      setIsGenerating(false);
    }, 400);
  }, [datosPredio, datosProfesional, currentLinderos, rumbos, areaM2, perimetroM]);

  const handleCopy = useCallback(async () => {
    if (!generatedText) return;
    try {
      await navigator.clipboard.writeText(generatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = generatedText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [generatedText]);

  const handleExportDocx = useCallback(async () => {
    if (!params.id) return;
    setExportingDocx(true);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      const res = await fetch(
        `${BASE_URL}/api/projects/${params.id}/documentos/docx`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!res.ok) {
        throw new Error("Error al exportar el documento");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `descripcion_${params.id}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export DOCX error:", err);
      alert("Error al exportar el documento. Verifique que el servidor este activo.");
    } finally {
      setExportingDocx(false);
    }
  }, [params.id]);

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="space-y-6">
      {/* ---- Header + Export Buttons ---- */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
              <FileOutput className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Resultado
              </h2>
              <p className="text-sm text-slate-500">
                Descripcion tecnica generada lista para uso profesional.
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
              {exportingDocx ? "Exportando..." : "Exportar DOCX"}
            </button>
            <button
              disabled
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-400 cursor-not-allowed"
              title="Proximamente"
            >
              <Download className="h-4 w-4" />
              Exportar PDF
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                Pronto
              </span>
            </button>
          </div>
        </div>

        {/* ---- Sub-tab Navigation ---- */}
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex gap-0">
            <button
              onClick={() => setActiveTab("descripcion")}
              className={cn(
                "inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                activeTab === "descripcion"
                  ? "border-teal-700 text-teal-700"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
              )}
            >
              <FileText className="h-4 w-4" />
              Descripcion Textual
            </button>
            <button
              onClick={() => setActiveTab("tabla")}
              className={cn(
                "inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                activeTab === "tabla"
                  ? "border-teal-700 text-teal-700"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
              )}
            >
              <Table className="h-4 w-4" />
              Tabla de Linderos
            </button>
          </nav>
        </div>

        {/* ---- Sub-tab Content ---- */}
        <div className="mt-6">
          {/* -- Descripcion Textual -- */}
          {activeTab === "descripcion" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50 transition-colors"
                >
                  {isGenerating ? (
                    <Clock className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {isGenerating ? "Generando..." : "Generar Descripcion"}
                </button>
                {generatedText && (
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copiar al Portapapeles
                      </>
                    )}
                  </button>
                )}
              </div>

              {generatedText ? (
                <div className="rounded-lg border border-slate-200 bg-white p-6 max-h-[600px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-slate-800 leading-relaxed">
                    {generatedText}
                  </pre>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                  <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">
                    Haga clic en &quot;Generar Descripcion&quot; para crear la
                    descripcion tecnica a partir de los datos del proyecto.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* -- Tabla de Linderos -- */}
          {activeTab === "tabla" && (
            <div>
              {currentLinderos.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-left">
                        <th className="px-4 py-3 font-medium text-slate-600">
                          #
                        </th>
                        <th className="px-4 py-3 font-medium text-slate-600">
                          Punto Inicio
                        </th>
                        <th className="px-4 py-3 font-medium text-slate-600">
                          Punto Fin
                        </th>
                        <th className="px-4 py-3 font-medium text-slate-600">
                          Rumbo
                        </th>
                        <th className="px-4 py-3 font-medium text-slate-600">
                          Distancia (m)
                        </th>
                        <th className="px-4 py-3 font-medium text-slate-600">
                          Colindante
                        </th>
                        <th className="px-4 py-3 font-medium text-slate-600">
                          Tipo Linea
                        </th>
                        <th className="px-4 py-3 font-medium text-slate-600">
                          Folio
                        </th>
                        <th className="px-4 py-3 font-medium text-slate-600">
                          Direccion
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentLinderos.map((l, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="px-4 py-3 font-semibold text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3 text-slate-800">
                            {l.puntoInicial || "-"}
                          </td>
                          <td className="px-4 py-3 text-slate-800">
                            {l.puntoFinal || "-"}
                          </td>
                          <td className="px-4 py-3 text-slate-800">
                            {l.rumbo || "-"}
                          </td>
                          <td className="px-4 py-3 text-slate-800 font-mono">
                            {l.distanciaTotal.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-slate-800">
                            {l.colindante || "-"}
                          </td>
                          <td className="px-4 py-3 text-slate-800">
                            {l.tipoLinea || "-"}
                          </td>
                          <td className="px-4 py-3 text-slate-800">
                            {l.folio || "-"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                              {getCardinalLabel(idx, rumbos)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                  <Table className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">
                    No hay linderos definidos. Vaya a la pestana
                    &quot;Linderos&quot; para configurarlos.
                  </p>
                </div>
              )}

              {/* Summary stats */}
              {currentLinderos.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-4">
                  <div className="rounded-lg bg-teal-50 border border-teal-200 px-4 py-3">
                    <p className="text-xs text-teal-600 font-medium">
                      Area Total
                    </p>
                    <p className="text-lg font-bold text-teal-800">
                      {areaM2 != null ? `${areaM2.toFixed(2)} m2` : "---"}
                    </p>
                    {areaM2 != null && (
                      <p className="text-xs text-teal-600">
                        {(areaM2 / 10000).toFixed(4)} ha
                      </p>
                    )}
                  </div>
                  <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
                    <p className="text-xs text-blue-600 font-medium">
                      Perimetro Total
                    </p>
                    <p className="text-lg font-bold text-blue-800">
                      {perimetroM != null
                        ? `${perimetroM.toFixed(2)} m`
                        : "---"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
                    <p className="text-xs text-amber-600 font-medium">
                      Total Linderos
                    </p>
                    <p className="text-lg font-bold text-amber-800">
                      {currentLinderos.length}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
