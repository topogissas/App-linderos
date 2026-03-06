from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import engine
from .db.models import Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Crea las tablas al iniciar la app (para desarrollo con SQLite)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# CORS - permitir localhost:3000 y cualquier origen en desarrollo
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "version": "0.1.0"}


# Routers
from .api import auth, projects, coordenadas, linderos, documentos

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(coordenadas.router, prefix="/api", tags=["coordenadas"])
app.include_router(linderos.router, prefix="/api", tags=["linderos"])
app.include_router(documentos.router, prefix="/api", tags=["documentos"])
