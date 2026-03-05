"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProjects, createProject, deleteProject } from "@/lib/api";
import { Plus, MapPin, Calendar, Trash2, Loader2 } from "lucide-react";

export default function ProjectsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const {
    data: projects,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const createMutation = useMutation({
    mutationFn: (title: string) => createProject(title),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      router.push(`/projects/${project.id}/datos`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createMutation.mutate(newTitle.trim());
    setShowNewDialog(false);
    setNewTitle("");
  }

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (window.confirm("Estas seguro de que deseas eliminar este proyecto?")) {
      deleteMutation.mutate(id);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatArea(m2: number | null) {
    if (m2 == null) return "Sin calcular";
    if (m2 >= 10000) return `${(m2 / 10000).toFixed(4)} ha`;
    return `${m2.toFixed(2)} m2`;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis Proyectos</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gestiona tus proyectos de linderos y descripciones tecnicas.
          </p>
        </div>
        <button
          onClick={() => setShowNewDialog(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo Proyecto
        </button>
      </div>

      {/* New project dialog */}
      {showNewDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">
              Nuevo Proyecto
            </h2>
            <form onSubmit={handleCreate} className="mt-4">
              <label
                htmlFor="projectTitle"
                className="block text-sm font-medium text-slate-700"
              >
                Nombre del proyecto
              </label>
              <input
                id="projectTitle"
                type="text"
                required
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="Ej: Predio El Paraiso - Lote 5"
              />
              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewDialog(false);
                    setNewTitle("");
                  }}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50 transition-colors"
                >
                  {createMutation.isPending ? "Creando..." : "Crear Proyecto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading && (
        <div className="mt-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
        </div>
      )}

      {error && (
        <div className="mt-8 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          Error al cargar los proyectos. Verifica tu conexion e intenta de
          nuevo.
        </div>
      )}

      {projects && projects.length === 0 && (
        <div className="mt-16 text-center">
          <MapPin className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-medium text-slate-900">
            Sin proyectos
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Crea tu primer proyecto para comenzar a generar linderos.
          </p>
        </div>
      )}

      {projects && projects.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => router.push(`/projects/${project.id}/datos`)}
              className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 hover:border-teal-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-base font-semibold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2">
                  {project.title}
                </h3>
                <button
                  onClick={(e) => handleDelete(e, project.id)}
                  className="rounded-md p-1 text-slate-400 opacity-0 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 transition-all"
                  title="Eliminar proyecto"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span>Area: {formatArea(project.area_m2)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>Modificado: {formatDate(project.updated_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
