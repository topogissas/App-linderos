"use client";

import { useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getProject } from "@/lib/api";
import { useProjectStore } from "@/store/projectStore";
import { useAutoSave } from "@/hooks/useAutoSave";
import { cn } from "@/lib/utils";
import {
  FileText,
  MapPinned,
  Route,
  FileOutput,
  ClipboardList,
  Loader2,
  Save,
} from "lucide-react";

const tabs = [
  { segment: "datos", label: "Datos", icon: FileText },
  { segment: "coordenadas", label: "Coordenadas", icon: MapPinned },
  { segment: "linderos", label: "Linderos", icon: Route },
  { segment: "resultado", label: "Resultado", icon: FileOutput },
  { segment: "acta", label: "Acta", icon: ClipboardList },
];

export default function ProjectEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const setProject = useProjectStore((s) => s.setProject);
  const isDirty = useProjectStore((s) => s.isDirty);
  const title = useProjectStore((s) => s.title);
  const { saveNow } = useAutoSave();

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", params.id],
    queryFn: () => getProject(params.id),
    enabled: !!params.id,
  });

  useEffect(() => {
    if (project) {
      setProject(project);
    }
  }, [project, setProject]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
      </div>
    );
  }

  return (
    <div>
      {/* Project header */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold text-slate-900 truncate">
          {title || "Cargando..."}
        </h1>
        <div className="flex items-center gap-2">
          {isDirty && (
            <button
              onClick={saveNow}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Save className="h-3.5 w-3.5" />
              Guardar
            </button>
          )}
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              isDirty
                ? "bg-amber-100 text-amber-700"
                : "bg-green-100 text-green-700"
            )}
          >
            {isDirty ? "Sin guardar" : "Guardado"}
          </span>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="mt-4 border-b border-slate-200">
        <nav className="-mb-px flex gap-0 overflow-x-auto">
          {tabs.map((tab) => {
            const href = `/projects/${params.id}/${tab.segment}`;
            const isActive = pathname.endsWith(`/${tab.segment}`);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.segment}
                href={href}
                className={cn(
                  "inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "border-teal-700 text-teal-700"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      <div className="mt-6">{children}</div>
    </div>
  );
}
