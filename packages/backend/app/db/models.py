"""Modelos SQLAlchemy para la base de datos (compatible SQLite y PostgreSQL)."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, JSON, String, Text
from sqlalchemy.orm import DeclarativeBase, relationship


def _uuid() -> str:
    return str(uuid.uuid4())


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), default="")
    is_active = Column(Boolean, default=True)

    # Stripe
    stripe_customer_id = Column(String(255), nullable=True)
    subscription_status = Column(String(50), default="inactive")
    subscription_plan = Column(String(50), nullable=True)
    subscription_current_period_end = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=_utcnow)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow)

    # Relaciones
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    professionals = relationship("Professional", back_populates="user", cascade="all, delete-orphan")


class Professional(Base):
    __tablename__ = "professionals"

    id = Column(String(36), primary_key=True, default=_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(100), default="Topografo")
    license_number = Column(String(100), nullable=True)

    created_at = Column(DateTime, default=_utcnow)

    user = relationship("User", back_populates="professionals")


class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), default="Nuevo Proyecto")

    datos_predio = Column(JSON, default=dict)
    datos_profesional = Column(JSON, default=dict)
    crs_config = Column(JSON, default=dict)
    segmentos = Column(JSON, default=list)
    linderos = Column(JSON, default=dict)
    rumbos_asignados = Column(JSON, default=lambda: {"NORTE": [], "ESTE": [], "SUR": [], "OESTE": []})
    acta_data = Column(JSON, default=dict)

    area_m2 = Column(Float, nullable=True)
    perimetro_m = Column(Float, nullable=True)

    imagen_plano_url = Column(Text, nullable=True)
    logo_url = Column(Text, nullable=True)
    schema_version = Column(String(20), default="3.0")

    created_at = Column(DateTime, default=_utcnow)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow)

    user = relationship("User", back_populates="projects")


class PaymentHistory(Base):
    __tablename__ = "payment_history"

    id = Column(String(36), primary_key=True, default=_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    stripe_event_id = Column(String(255), nullable=True)
    event_type = Column(String(100), nullable=True)
    amount_cents = Column(Float, nullable=True)
    currency = Column(String(10), default="usd")
    status = Column(String(50), nullable=True)

    created_at = Column(DateTime, default=_utcnow)
