"use client";

import Link from "next/link";
import { Compass, Check } from "lucide-react";

const plans = [
  {
    name: "Mensual",
    price: "$15",
    period: "/mes",
    description: "Ideal para proyectos puntuales y freelancers.",
    features: [
      "Proyectos ilimitados",
      "Exportacion a PDF",
      "Actas de colindancia",
      "Calculo de rumbos automatico",
      "Soporte por correo",
    ],
    highlighted: false,
  },
  {
    name: "Anual",
    price: "$120",
    period: "/ano",
    badge: "Ahorra 33%",
    description: "La mejor opcion para profesionales con trabajo constante.",
    features: [
      "Todo lo del plan Mensual",
      "Exportacion masiva",
      "Plantillas personalizadas",
      "Soporte prioritario",
      "Acceso anticipado a nuevas funciones",
    ],
    highlighted: true,
  },
];

export default function PlanesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-sky-50">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Compass className="h-7 w-7 text-teal-700" />
              <span className="text-xl font-bold text-slate-900">
                TopoGIS Linderos
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Iniciar Sesion
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 transition-colors"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Planes y Precios
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Elige el plan que mejor se adapte a tus necesidades. Cancela en
            cualquier momento.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 ${
                plan.highlighted
                  ? "border-teal-700 bg-white shadow-lg ring-1 ring-teal-700"
                  : "border-slate-200 bg-white"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-6 rounded-full bg-teal-700 px-3 py-1 text-xs font-semibold text-white">
                  {plan.badge}
                </span>
              )}

              <h2 className="text-lg font-semibold text-slate-900">
                {plan.name}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{plan.description}</p>

              <div className="mt-6">
                <span className="text-4xl font-bold text-slate-900">
                  {plan.price}
                </span>
                <span className="text-sm text-slate-500"> USD{plan.period}</span>
              </div>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                    <span className="text-sm text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`mt-8 block rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors ${
                  plan.highlighted
                    ? "bg-teal-700 text-white hover:bg-teal-800"
                    : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Suscribirse
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Todos los precios estan en dolares americanos (USD). Incluye acceso
          completo a la plataforma.
        </p>
      </div>
    </div>
  );
}
