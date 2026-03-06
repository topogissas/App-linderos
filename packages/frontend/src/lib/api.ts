const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ---------- helpers ----------

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) ?? {}),
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      (body as Record<string, unknown>).detail ??
      (body as Record<string, unknown>).message ??
      res.statusText;
    throw new Error(String(message));
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;

  return res.json() as Promise<T>;
}

// ---------- types ----------

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  subscription_status: string;
  subscription_plan: string | null;
}

export interface ProjectSummary {
  id: string;
  title: string;
  area_m2: number | null;
  perimetro_m: number | null;
  updated_at: string;
}

export interface Project {
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
  updated_at: string;
  created_at: string;
}

// ---------- auth ----------

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  // FastAPI OAuth2 expects form-encoded data
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username: email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      String((body as Record<string, unknown>).detail ?? "Error al iniciar sesion")
    );
  }

  return res.json();
}

export async function register(
  full_name: string,
  email: string,
  password: string
): Promise<LoginResponse> {
  return fetchApi<LoginResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ full_name, email, password }),
  });
}

export async function getMe(): Promise<User> {
  return fetchApi<User>("/api/auth/me");
}

// ---------- projects ----------

export async function getProjects(): Promise<ProjectSummary[]> {
  return fetchApi<ProjectSummary[]>("/api/projects/");
}

export async function getProject(id: string): Promise<Project> {
  return fetchApi<Project>(`/api/projects/${id}`);
}

export async function createProject(
  title: string
): Promise<Project> {
  return fetchApi<Project>("/api/projects/", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export async function updateProject(
  id: string,
  data: Partial<Project>
): Promise<Project> {
  return fetchApi<Project>(`/api/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProject(id: string): Promise<void> {
  return fetchApi<void>(`/api/projects/${id}`, {
    method: "DELETE",
  });
}
