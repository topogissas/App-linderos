"""Modelos SQLAlchemy para la base de datos PostgreSQL."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), default="")
    is_active = Column(Boolean, default=True)

    # Stripe
    stripe_customer_id = Column(String(255), nullable=True)
    subscription_status = Column(String(50), default="inactive")  # active/inactive/past_due/canceled
    subscription_plan = Column(String(50), nullable=True)  # monthly/annual
    subscription_current_period_end = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relaciones
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    professionals = relationship("Professional", back_populates="user", cascade="all, delete-orphan")


class Professional(Base):
    __tablename__ = "professionals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(100), default="Topografo")
    license_number = Column(String(100), nullable=True)  # tarjeta profesional

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="professionals")


class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), default="Nuevo Proyecto")

    # Datos del predio y profesional (JSON flexible)
    datos_predio = Column(JSONB, default=dict)
    datos_profesional = Column(JSONB, default=dict)

    # CRS
    crs_config = Column(JSONB, default=dict)

    # Coordenadas (array de segmentos)
    segmentos = Column(JSONB, default=list)

    # Linderos configurados
    linderos = Column(JSONB, default=dict)

    # Rumbos asignados (NORTE/ESTE/SUR/OESTE -> [idx])
    rumbos_asignados = Column(JSONB, default=lambda: {"NORTE": [], "ESTE": [], "SUR": [], "OESTE": []})

    # Datos del acta de colindancia
    acta_data = Column(JSONB, default=dict)

    # Geometría calculada (cache)
    area_m2 = Column(Float, nullable=True)
    perimetro_m = Column(Float, nullable=True)

    # Archivos (URLs en storage)
    imagen_plano_url = Column(Text, nullable=True)
    logo_url = Column(Text, nullable=True)

    # Schema version para migración de datos
    schema_version = Column(String(20), default="3.0")

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="projects")


class PaymentHistory(Base):
    __tablename__ = "payment_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    stripe_event_id = Column(String(255), nullable=True)
    event_type = Column(String(100), nullable=True)
    amount_cents = Column(Float, nullable=True)
    currency = Column(String(10), default="usd")
    status = Column(String(50), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
