"use client";

import { MapPinned, Plus, Trash2, Upload, RefreshCw, Map } from "lucide-react";
import { useProjectStore } from "@/store/projectStore";
import { CRS_CATALOG, PAISES_CRS } from "@/lib/constants";
import { useCallback, useMemo, useState } from "react";

interface Segmento {
  inicio: string;
  fin: string;
  rumbo: string;
  distancia: number | null;
  este: number | null;
  norte: number | null;
  observaciones: string;
}

const emptySegmento = (): Segmento => ({
  inicio: "", fin: "", rumbo: "", distancia: null, este: null, norte: null, observaciones: "",
});

export default function CoordenadasPage() {
  const segmentos = useProjectStore((s) => s.segmentos) as Segmento[];
  const crsConfig = useProjectStore((s) => s.crsConfig);
  const areaM2 = useProjectStore((s) => s.areaM2);
  const perimetroM = useProjectStore((s) => s.perimetroM);
  const updateField = useProjectStore((s) => s.updateField);
  const setSegmentos = useProjectStore((s) => s.setSegmentos);

  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [pais, setPais] = useState<string>(crsConfig?.pais || "Colombia");
  const [epsg, setEpsg] = useState<number>(crsConfig?.epsg || 3116);

  const crsSistemas = useMemo(() => CRS_CATALOG[pais] || [], [pais]);
  const selectedCrs = crsSistemas.find((c) => c.epsg === epsg);

  const handlePaisChange = (p: string) => {
    setPais(p);
    const first = CRS_CATALOG[p]?.[0];
    if (first) setEpsg(first.epsg);
    updateField("crsConfig", { pais: p, epsg: first?.epsg || 4326 });
  };

  const handleEpsgChange = (e: number) => {
    setEpsg(e);
    updateField("crsConfig", { pais, epsg: e });
  };

  const addRow = () => {
    const n = segmentos.length;
    const newSeg = emptySegmento();
    newSeg.inicio = `P${n + 1}`;
    newSeg.fin = `P${n + 2}`;
    setSegmentos([...segmentos, newSeg]);
  };

  const deleteRow = () => {
    if (selectedRow == null) return;
    const updated = segmentos.filter((_, i) => i !== selectedRow);
    setSegmentos(updated);
    setSelectedRow(null);
  };

  const updateSeg = useCallback(
    (idx: number, key: keyof Segmento, value: string) => {
      const updated = [...segmentos];
      const seg = { ...updated[idx] };
      if (key === "distancia" || key === "este" || key === "norte") {
        const num = value === "" ? null : parseFloat(value.replace(",", "."));
        (seg as any)[key] = num;
      } else {
        (seg as any)[key] = value;
      }
      updated[idx] = seg;
      setSegmentos(updated);
    },
    [segmentos, setSegmentos]
  );

  const formatNum = (n: number | null) => {
    if (n == null) return "—";
    return n.toLocaleString("es-CO", { maximumFractionDigits: 2 });
  };

  const areaHa = areaM2 != null && areaM2 >= 10000 ? (areaM2 / 10000).toFixed(4) : null;

  return (
    <div className="space-y-4">
      {/* CRS SELECTOR + TOOLBAR */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-end gap-4">
          {/* País */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">País</label>
            <select value={pais} onChange={(e) => handlePaisChange(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-teal-500 outline-none">
              {PAISES_CRS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          {/* Sistema CRS */}
          <div className="flex-1 min-w-[250px]">
            <label className="block text-xs font-medium text-slate-600 mb-1">Sistema de Referencia (CRS)</label>
            <select value={epsg} onChange={(e) => handleEpsgChange(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-teal-500 outline-none">
              {crsSistemas.map((c) => <option key={c.epsg} value={c.epsg}>{c.label} (EPSG:{c.epsg})</option>)}
            </select>
          </div>
          {/* EPSG badge */}
          <div className="rounded-lg bg-teal-50 border border-teal-200 px-3 py-2 text-sm font-mono text-teal-700">
            EPSG:{epsg}
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-wrap gap-2">
        <button onClick={addRow}
          className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 transition">
          <Plus className="h-4 w-4" /> Agregar Fila
        </button>
        <button onClick={deleteRow} disabled={selectedRow == null}
          className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-40 transition">
          <Trash2 className="h-4 w-4" /> Eliminar Fila
        </button>
        <button className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-100 transition">
          <Upload className="h-4 w-4" /> Importar
        </button>
        <button className="flex items-center gap-1.5 rounded-lg bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700 border border-sky-200 hover:bg-sky-100 transition">
          <RefreshCw className="h-4 w-4" /> Recalcular
        </button>
      </div>

      <div className="flex gap-4 flex-col lg:flex-row">
        {/* TABLA */}
        <div className="flex-1 rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["#", "Punto Inicio", "Punto Fin", "Rumbo", "Distancia", "Este (X)", "Norte (Y)", "Obs."].map((h) => (
                    <th key={h} className="px-2 py-2.5 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {segmentos.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-400 text-sm">
                      No hay coordenadas. Haz clic en &quot;Agregar Fila&quot; para comenzar.
                    </td>
                  </tr>
                ) : (
                  segmentos.map((seg, i) => (
                    <tr
                      key={i}
                      onClick={() => setSelectedRow(i)}
                      className={`border-b border-slate-100 cursor-pointer transition ${
                        selectedRow === i ? "bg-teal-50" : i % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                      } hover:bg-teal-50/50`}
                    >
                      <td className="px-2 py-1.5 text-xs text-slate-400 font-mono">{i + 1}</td>
                      <td className="px-1 py-1">
                        <input value={seg.inicio} onChange={(e) => updateSeg(i, "inicio", e.target.value)}
                          className="w-20 rounded border border-transparent px-1.5 py-1 text-sm focus:border-teal-400 focus:bg-white outline-none bg-transparent" />
                      </td>
                      <td className="px-1 py-1">
                        <input value={seg.fin} onChange={(e) => updateSeg(i, "fin", e.target.value)}
                          className="w-20 rounded border border-transparent px-1.5 py-1 text-sm focus:border-teal-400 focus:bg-white outline-none bg-transparent" />
                      </td>
                      <td className="px-1 py-1">
                        <input value={seg.rumbo} onChange={(e) => updateSeg(i, "rumbo", e.target.value)}
                          className="w-32 rounded border border-transparent px-1.5 py-1 text-sm focus:border-teal-400 focus:bg-white outline-none bg-transparent" />
                      </td>
                      <td className="px-1 py-1">
                        <input value={seg.distancia ?? ""} onChange={(e) => updateSeg(i, "distancia", e.target.value)}
                          className="w-20 rounded border border-transparent px-1.5 py-1 text-sm text-right focus:border-teal-400 focus:bg-white outline-none bg-transparent font-mono" />
                      </td>
                      <td className="px-1 py-1">
                        <input value={seg.este ?? ""} onChange={(e) => updateSeg(i, "este", e.target.value)}
                          className="w-28 rounded border border-transparent px-1.5 py-1 text-sm text-right focus:border-teal-400 focus:bg-white outline-none bg-transparent font-mono" />
                      </td>
                      <td className="px-1 py-1">
                        <input value={seg.norte ?? ""} onChange={(e) => updateSeg(i, "norte", e.target.value)}
                          className="w-28 rounded border border-transparent px-1.5 py-1 text-sm text-right focus:border-teal-400 focus:bg-white outline-none bg-transparent font-mono" />
                      </td>
                      <td className="px-1 py-1">
                        <input value={seg.observaciones} onChange={(e) => updateSeg(i, "observaciones", e.target.value)}
                          className="w-24 rounded border border-transparent px-1.5 py-1 text-sm focus:border-teal-400 focus:bg-white outline-none bg-transparent" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
            {segmentos.length} {segmentos.length === 1 ? "punto" : "puntos"} registrados
          </div>
        </div>

        {/* PANEL LATERAL - GEOMETRÍA + MAPA */}
        <div className="w-full lg:w-72 space-y-4 flex-shrink-0">
          {/* Geometría */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">Geometría</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Área</span>
                <span className="font-semibold text-slate-900 font-mono">{formatNum(areaM2)} m²</span>
              </div>
              {areaHa && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Hectáreas</span>
                  <span className="font-semibold text-teal-700 font-mono">{areaHa} ha</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Perímetro</span>
                <span className="font-semibold text-slate-900 font-mono">{formatNum(perimetroM)} m</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">CRS</span>
                <span className="text-xs font-mono text-teal-600">EPSG:{epsg}</span>
              </div>
            </div>
          </div>

          {/* Mini Mapa placeholder */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2">
              <Map className="h-4 w-4 text-teal-600" />
              <span className="text-sm font-semibold text-slate-700">Vista Previa</span>
            </div>
            <div className="h-64 bg-slate-50 flex items-center justify-center p-4">
              <div className="text-center">
                <MapPinned className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Mapa interactivo</p>
                <p className="text-xs text-slate-400">Se activará con Leaflet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
