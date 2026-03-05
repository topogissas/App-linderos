"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, FileText, Compass, Shield } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/projects");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="h-7 w-7 text-teal-700" />
              <span className="text-xl font-bold text-slate-900">
                TopoGIS Linderos
              </span>
            </div>
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

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-sky-50" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              TopoGIS{" "}
              <span className="text-teal-700">Linderos</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600 sm:text-xl">
              Genera descripciones tecnicas de linderos profesionales desde
              cualquier lugar. Automatiza el calculo de rumbos, distancias y
              colindancias con precision topografica.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/register"
                className="rounded-lg bg-teal-700 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-teal-800 transition-colors"
              >
                Comenzar Gratis
              </Link>
              <Link
                href="/planes"
                className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
              >
                Ver Planes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Todo lo que necesitas para tus linderos
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Una plataforma completa para profesionales de la topografia y la
              ingenieria.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<MapPin className="h-6 w-6" />}
              title="Coordenadas UTM y Geo"
              description="Importa coordenadas UTM o geograficas y convierte entre sistemas de referencia automaticamente."
            />
            <FeatureCard
              icon={<Compass className="h-6 w-6" />}
              title="Rumbos y Distancias"
              description="Calculo automatico de rumbos astronomicos, magneticos y distancias entre vertices."
            />
            <FeatureCard
              icon={<FileText className="h-6 w-6" />}
              title="Descripciones Tecnicas"
              description="Genera textos profesionales listos para escrituras publicas y tramites legales."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Actas de Colindancia"
              description="Crea actas de colindancia con datos de colindantes, firmas y formatos oficiales."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal-700 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">
            Empieza a generar linderos hoy
          </h2>
          <p className="mt-4 text-lg text-teal-100">
            Registrate gratis y crea tu primer proyecto en minutos.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-block rounded-lg bg-white px-6 py-3 text-base font-semibold text-teal-700 shadow-sm hover:bg-teal-50 transition-colors"
          >
            Crear Cuenta Gratuita
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
          <p>&copy; 2026 TopoGIS Linderos. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
