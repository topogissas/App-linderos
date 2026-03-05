"use client";

import { useState, useMemo, useCallback } from "react";
import { useProjectStore } from "@/store/projectStore";
import { cn } from "@/lib/utils";
import {
  Route,
  Plus,
  RefreshCw,
  Compass,
  MapPin,
  Trash2,
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

const TIPO_LINEA_OPTIONS = ["Recta", "Curva", "Quebrada", "Irregular"];

const CARDINAL_KEYS: (keyof RumbosAsignados)[] = [
  "NORTE",
  "ESTE",
  "SUR",
  "OESTE",
];

const CARDINAL_COLORS: Record<string, string> = {
  NORTE: "bg-blue-50 border-blue-200 text-blue-800",
  ESTE: "bg-amber-50 border-amber-200 text-amber-800",
  SUR: "bg-red-50 border-red-200 text-red-800",
  OESTE: "bg-emerald-50 border-emerald-200 text-emerald-800",
};

const CARDINAL_ICONS: Record<string, string> = {
  NORTE: "N",
  ESTE: "E",
  SUR: "S",
  OESTE: "O",
};

/* ------------------------------------------------------------------ */
/*  Helper: extract unique point names from segmentos                  */
/* ------------------------------------------------------------------ */

function extractPointNames(segmentos: unknown[]): string[] {
  const names = new Set<string>();
  for (const seg of segmentos) {
    const s = seg as Record<string, unknown>;
    if (s.inicio && typeof s.inicio === "string") names.add(s.inicio);
    if (s.fin && typeof s.fin === "string") names.add(s.fin);
    // Also handle nested objects with name field
    if (s.inicio && typeof s.inicio === "object") {
      const ini = s.inicio as Record<string, unknown>;
      if (ini.nombre && typeof ini.nombre === "string") names.add(ini.nombre);
      if (ini.name && typeof ini.name === "string") names.add(ini.name);
    }
    if (s.fin && typeof s.fin === "object") {
      const fin = s.fin as Record<string, unknown>;
      if (fin.nombre && typeof fin.nombre === "string") names.add(fin.nombre);
      if (fin.name && typeof fin.name === "string") names.add(fin.name);
    }
    // Handle punto_inicio / punto_fin naming
    if (s.punto_inicio && typeof s.punto_inicio === "string")
      names.add(s.punto_inicio);
    if (s.punto_fin && typeof s.punto_fin === "string")
      names.add(s.punto_fin);
  }
  return Array.from(names).sort();
}

/* ------------------------------------------------------------------ */
/*  Default Lindero                                                    */
/* ------------------------------------------------------------------ */

function createDefaultLindero(): Lindero {
  return {
    puntoInicial: "",
    puntoFinal: "",
    rumbo: "",
    distanciaTotal: 0,
    colindante: "",
    tipoLinea: "Recta",
    folio: "",
    cedula: "",
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function LinderosPage() {
  const segmentos = useProjectStore((s) => s.segmentos);
  const linderos = useProjectStore((s) => s.linderos);
  const rumbosAsignados = useProjectStore((s) => s.rumbosAsignados);
  const updateField = useProjectStore((s) => s.updateField);

  /* ---- Derive point names ---- */
  const pointNames = useMemo(() => extractPointNames(segmentos), [segmentos]);

  /* ---- Local state for number of linderos input ---- */
  const currentLinderos = useMemo<Lindero[]>(() => {
    if (Array.isArray(linderos) && linderos.length > 0) {
      return linderos as Lindero[];
    }
    return Array.from({ length: 4 }, () => createDefaultLindero());
  }, [linderos]);

  const [numLinderos, setNumLinderos] = useState<number>(
    currentLinderos.length
  );

  const currentRumbos = useMemo<RumbosAsignados>(() => {
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

  /* ---- Actions ---- */

  const handleUpdateCount = useCallback(() => {
    const count = Math.max(1, Math.min(numLinderos, 30));
    const newList: Lindero[] = [];
    for (let i = 0; i < count; i++) {
      newList.push(
        i < currentLinderos.length
          ? { ...currentLinderos[i] }
          : createDefaultLindero()
      );
    }
    updateField("linderos", newList as unknown[]);
  }, [numLinderos, currentLinderos, updateField]);

  const handleAddRow = useCallback(() => {
    const newList = [...currentLinderos, createDefaultLindero()];
    updateField("linderos", newList as unknown[]);
    setNumLinderos(newList.length);
  }, [currentLinderos, updateField]);

  const handleDeleteRow = useCallback(
    (idx: number) => {
      if (currentLinderos.length <= 1) return;
      const newList = currentLinderos.filter((_, i) => i !== idx);
      updateField("linderos", newList as unknown[]);
      setNumLinderos(newList.length);
      // Clean up rumbos referencing deleted index
      const newRumbos: RumbosAsignados = {
        NORTE: currentRumbos.NORTE.filter((n) => n !== idx).map((n) =>
          n > idx ? n - 1 : n
        ),
        ESTE: currentRumbos.ESTE.filter((n) => n !== idx).map((n) =>
          n > idx ? n - 1 : n
        ),
        SUR: currentRumbos.SUR.filter((n) => n !== idx).map((n) =>
          n > idx ? n - 1 : n
        ),
        OESTE: currentRumbos.OESTE.filter((n) => n !== idx).map((n) =>
          n > idx ? n - 1 : n
        ),
      };
      updateField("rumbosAsignados", newRumbos as unknown as Record<string, unknown>);
    },
    [currentLinderos, currentRumbos, updateField]
  );

  const handleLinderoChange = useCallback(
    (index: number, field: keyof Lindero, value: string | number) => {
      const updated = currentLinderos.map((l, i) =>
        i === index ? { ...l, [field]: value } : l
      );
      updateField("linderos", updated as unknown[]);
    },
    [currentLinderos, updateField]
  );

  const handleRumboToggle = useCallback(
    (cardinal: keyof RumbosAsignados, linderoIdx: number) => {
      const newRumbos = { ...currentRumbos };
      const arr = [...newRumbos[cardinal]];
      const pos = arr.indexOf(linderoIdx);
      if (pos >= 0) {
        arr.splice(pos, 1);
      } else {
        arr.push(linderoIdx);
      }
      newRumbos[cardinal] = arr;
      updateField("rumbosAsignados", newRumbos as unknown as Record<string, unknown>);
    },
    [currentRumbos, updateField]
  );

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="space-y-6">
      {/* ---- Header ---- */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
            <Route className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Linderos</h2>
            <p className="text-sm text-slate-500">
              Definicion de linderos, colindancias y agrupacion por direccion
              cardinal.
            </p>
          </div>
        </div>

        {/* ---- Section 1: Number of Linderos ---- */}
        <div className="flex flex-wrap items-end gap-4 mb-6 pb-6 border-b border-slate-100">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Numero de Linderos
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={numLinderos}
              onChange={(e) => setNumLinderos(parseInt(e.target.value) || 1)}
              className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
            />
          </div>
          <button
            onClick={handleUpdateCount}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
          <button
            onClick={handleAddRow}
            className="inline-flex items-center gap-2 rounded-lg border border-teal-300 px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Agregar Fila
          </button>
        </div>

        {/* ---- Section 4: Points Summary ---- */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5">
            <MapPin className="h-4 w-4 text-slate-500" />
            <span className="text-sm text-slate-600">
              Puntos disponibles:{" "}
              <strong className="text-slate-800">{pointNames.length}</strong>
            </span>
          </div>
          {pointNames.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {pointNames.map((name) => (
                <span
                  key={name}
                  className="inline-block rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700 border border-teal-200"
                >
                  {name}
                </span>
              ))}
            </div>
          )}
          {pointNames.length === 0 && (
            <span className="text-xs text-slate-400">
              No hay puntos definidos en la pestana Coordenadas.
            </span>
          )}
        </div>
      </div>

      {/* ---- Section 2: Linderos Table ---- */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700">
            Tabla de Linderos
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-3 py-2.5 font-medium text-slate-600 w-10">
                  #
                </th>
                <th className="px-3 py-2.5 font-medium text-slate-600 min-w-[130px]">
                  Punto Inicial
                </th>
                <th className="px-3 py-2.5 font-medium text-slate-600 min-w-[130px]">
                  Punto Final
                </th>
                <th className="px-3 py-2.5 font-medium text-slate-600 min-w-[120px]">
                  Rumbo
                </th>
                <th className="px-3 py-2.5 font-medium text-slate-600 min-w-[110px]">
                  Distancia (m)
                </th>
                <th className="px-3 py-2.5 font-medium text-slate-600 min-w-[150px]">
                  Colindante
                </th>
                <th className="px-3 py-2.5 font-medium text-slate-600 min-w-[120px]">
                  Tipo Linea
                </th>
                <th className="px-3 py-2.5 font-medium text-slate-600 min-w-[120px]">
                  Folio
                </th>
                <th className="px-3 py-2.5 font-medium text-slate-600 min-w-[120px]">
                  Cedula
                </th>
                <th className="px-3 py-2.5 font-medium text-slate-600 w-10">
                  {/* delete */}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentLinderos.map((lindero, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  {/* # */}
                  <td className="px-3 py-2 text-center font-semibold text-slate-500">
                    {idx + 1}
                  </td>

                  {/* Punto Inicial */}
                  <td className="px-3 py-2">
                    <select
                      value={lindero.puntoInicial}
                      onChange={(e) =>
                        handleLinderoChange(idx, "puntoInicial", e.target.value)
                      }
                      className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                    >
                      <option value="">-- Seleccionar --</option>
                      {pointNames.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Punto Final */}
                  <td className="px-3 py-2">
                    <select
                      value={lindero.puntoFinal}
                      onChange={(e) =>
                        handleLinderoChange(idx, "puntoFinal", e.target.value)
                      }
                      className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                    >
                      <option value="">-- Seleccionar --</option>
                      {pointNames.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Rumbo */}
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={lindero.rumbo}
                      onChange={(e) =>
                        handleLinderoChange(idx, "rumbo", e.target.value)
                      }
                      placeholder="N 45 30 E"
                      className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                    />
                  </td>

                  {/* Distancia Total */}
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={lindero.distanciaTotal}
                      onChange={(e) =>
                        handleLinderoChange(
                          idx,
                          "distanciaTotal",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                    />
                  </td>

                  {/* Colindante */}
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={lindero.colindante}
                      onChange={(e) =>
                        handleLinderoChange(idx, "colindante", e.target.value)
                      }
                      placeholder="Nombre del colindante"
                      className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                    />
                  </td>

                  {/* Tipo Linea */}
                  <td className="px-3 py-2">
                    <select
                      value={lindero.tipoLinea}
                      onChange={(e) =>
                        handleLinderoChange(idx, "tipoLinea", e.target.value)
                      }
                      className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                    >
                      {TIPO_LINEA_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Folio */}
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={lindero.folio}
                      onChange={(e) =>
                        handleLinderoChange(idx, "folio", e.target.value)
                      }
                      placeholder="Folio"
                      className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                    />
                  </td>

                  {/* Cedula */}
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={lindero.cedula}
                      onChange={(e) =>
                        handleLinderoChange(idx, "cedula", e.target.value)
                      }
                      placeholder="Cedula"
                      className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                    />
                  </td>

                  {/* Delete */}
                  <td className="px-3 py-2">
                    <button
                      onClick={() => handleDeleteRow(idx)}
                      disabled={currentLinderos.length <= 1}
                      className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Eliminar lindero"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- Section 3: Cardinal Direction Assignment ---- */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
            <Compass className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700">
            Asignacion de Rumbo Cardinal
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Seleccione a que direccion cardinal pertenece cada lindero. Un lindero
          puede pertenecer a mas de una direccion si esta en una esquina.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CARDINAL_KEYS.map((cardinal) => (
            <div
              key={cardinal}
              className={cn(
                "rounded-lg border p-4",
                CARDINAL_COLORS[cardinal]
              )}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-xs font-bold">
                  {CARDINAL_ICONS[cardinal]}
                </span>
                <span className="text-sm font-semibold">{cardinal}</span>
              </div>
              <div className="space-y-1.5">
                {currentLinderos.map((_, idx) => {
                  const isChecked = currentRumbos[cardinal].includes(idx);
                  return (
                    <label
                      key={idx}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleRumboToggle(cardinal, idx)}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
                      />
                      <span className="text-sm">
                        Lindero {idx + 1}
                        {currentLinderos[idx]?.colindante
                          ? ` - ${currentLinderos[idx].colindante}`
                          : ""}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
