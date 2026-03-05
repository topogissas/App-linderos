"use client";

import { useEffect, useRef, useCallback } from "react";
import { useProjectStore } from "@/store/projectStore";
import { updateProject } from "@/lib/api";

const DEBOUNCE_MS = 3000;

export function useAutoSave() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);

  const save = useCallback(async () => {
    const state = useProjectStore.getState();
    if (!state.id || !state.isDirty || savingRef.current) return;

    savingRef.current = true;

    try {
      await updateProject(state.id, {
        title: state.title,
        datos_predio: state.datosPredio,
        datos_profesional: state.datosProfesional,
        crs_config: state.crsConfig,
        segmentos: state.segmentos,
        linderos: state.linderos,
        rumbos_asignados: state.rumbosAsignados,
        acta_data: state.actaData,
        area_m2: state.areaM2,
        perimetro_m: state.perimetroM,
      } as Parameters<typeof updateProject>[1]);

      state.markClean();
    } catch (err) {
      console.error("Auto-save failed:", err);
    } finally {
      savingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = useProjectStore.subscribe((state) => {
      if (!state.isDirty) return;

      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        save();
      }, DEBOUNCE_MS);
    });

    return () => {
      unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [save]);

  return { saveNow: save };
}
