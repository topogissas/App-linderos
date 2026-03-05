import { create } from "zustand";

export interface ProjectState {
  /* ---- data ---- */
  id: string | null;
  title: string;
  datosPredio: Record<string, unknown>;
  datosProfesional: Record<string, unknown>;
  crsConfig: Record<string, unknown>;
  segmentos: unknown[];
  linderos: unknown[];
  rumbosAsignados: Record<string, unknown>;
  actaData: Record<string, unknown>;
  areaM2: number | null;
  perimetroM: number | null;
  isDirty: boolean;

  /* ---- actions ---- */
  setProject: (project: {
    id: string;
    title: string;
    datos_predio: Record<string, unknown>;
    datos_profesional: Record<string, unknown>;
    crs_config: Record<string, unknown>;
    segmentos: unknown[];
    linderos: unknown[];
    rumbos_asignados: Record<string, unknown>;
    acta_data: Record<string, unknown>;
    area_m2: number | null;
    perimetro_m: number | null;
  }) => void;
  updateField: <K extends keyof ProjectState>(
    field: K,
    value: ProjectState[K]
  ) => void;
  setSegmentos: (segmentos: unknown[]) => void;
  setLinderos: (linderos: unknown[]) => void;
  markDirty: () => void;
  markClean: () => void;
  reset: () => void;
}

const initialState = {
  id: null,
  title: "",
  datosPredio: {},
  datosProfesional: {},
  crsConfig: {},
  segmentos: [],
  linderos: [],
  rumbosAsignados: {},
  actaData: {},
  areaM2: null,
  perimetroM: null,
  isDirty: false,
};

export const useProjectStore = create<ProjectState>((set) => ({
  ...initialState,

  setProject: (project) =>
    set({
      id: project.id,
      title: project.title,
      datosPredio: project.datos_predio ?? {},
      datosProfesional: project.datos_profesional ?? {},
      crsConfig: project.crs_config ?? {},
      segmentos: project.segmentos ?? [],
      linderos: project.linderos ?? [],
      rumbosAsignados: project.rumbos_asignados ?? {},
      actaData: project.acta_data ?? {},
      areaM2: project.area_m2,
      perimetroM: project.perimetro_m,
      isDirty: false,
    }),

  updateField: (field, value) =>
    set((state) => ({
      ...state,
      [field]: value,
      isDirty: true,
    })),

  setSegmentos: (segmentos) => set({ segmentos, isDirty: true }),

  setLinderos: (linderos) => set({ linderos, isDirty: true }),

  markDirty: () => set({ isDirty: true }),

  markClean: () => set({ isDirty: false }),

  reset: () => set(initialState),
}));
