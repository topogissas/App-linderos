"use client";

import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/api";
import { User, CreditCard, Loader2, Shield } from "lucide-react";

export default function AccountPage() {
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
        Error al cargar la informacion de la cuenta. Intenta de nuevo.
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Mi Cuenta</h1>
      <p className="mt-1 text-sm text-slate-500">
        Gestiona tu perfil y suscripcion.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Profile card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
              <User className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Perfil</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Nombre
              </label>
              <p className="mt-1 text-sm text-slate-900">
                {user?.full_name || "---"}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Correo electronico
              </label>
              <p className="mt-1 text-sm text-slate-900">
                {user?.email || "---"}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Estado
              </label>
              <span
                className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  user?.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {user?.is_active ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>
        </div>

        {/* Subscription card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
              <CreditCard className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              Suscripcion
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Plan actual
              </label>
              <p className="mt-1 text-sm font-medium text-slate-900 capitalize">
                {user?.subscription_tier || "Gratuito"}
              </p>
            </div>
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
              <Shield className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">
                La gestion de suscripciones estara disponible proximamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
