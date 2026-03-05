"""Router de autenticacion: registro, login, refresh y perfil del usuario."""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.db import crud
from app.schemas.auth import Token, UserLogin, UserRegister, UserResponse

router = APIRouter()

# ---------------------------------------------------------------------------
# Utilidades de hashing y JWT
# ---------------------------------------------------------------------------

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def hash_password(password: str) -> str:
    """Genera el hash bcrypt de una contrasenya."""
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """Verifica una contrasenya en texto plano contra su hash."""
    return pwd_context.verify(plain, hashed)


def create_access_token(
    subject: str,
    expires_delta: timedelta | None = None,
) -> str:
    """Genera un JWT firmado con HS256.

    ``subject`` suele ser el user_id como string.
    """
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


# ---------------------------------------------------------------------------
# Dependency: usuario autenticado
# ---------------------------------------------------------------------------

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    """Dependencia de FastAPI que decodifica el JWT del header Authorization
    y retorna el objeto User correspondiente.

    Lanza 401 si el token es invalido o el usuario no existe.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token invalido o expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.secret_key, algorithms=[settings.algorithm]
        )
        user_id_str: str | None = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise credentials_exception

    user = await crud.get_user_by_id(db, user_id)
    if user is None or not user.is_active:
        raise credentials_exception
    return user


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post(
    "/register",
    response_model=Token,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar un nuevo usuario",
)
async def register(body: UserRegister, db: AsyncSession = Depends(get_db)):
    """Crea una cuenta nueva y devuelve un JWT de acceso."""
    existing = await crud.get_user_by_email(db, body.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un usuario con ese correo electronico",
        )

    user = await crud.create_user(
        db,
        {
            "email": body.email,
            "password_hash": hash_password(body.password),
            "full_name": body.full_name,
        },
    )
    token = create_access_token(str(user.id))
    return Token(access_token=token)


@router.post(
    "/login",
    response_model=Token,
    summary="Iniciar sesion",
)
async def login(body: UserLogin, db: AsyncSession = Depends(get_db)):
    """Valida credenciales y devuelve un JWT de acceso."""
    user = await crud.get_user_by_email(db, body.email)
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales invalidas",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cuenta desactivada",
        )
    token = create_access_token(str(user.id))
    return Token(access_token=token)


@router.post(
    "/refresh",
    response_model=Token,
    summary="Renovar token de acceso",
)
async def refresh(
    current_user=Depends(get_current_user),
):
    """Genera un nuevo token de acceso a partir de uno existente valido."""
    token = create_access_token(str(current_user.id))
    return Token(access_token=token)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Obtener perfil del usuario autenticado",
)
async def me(current_user=Depends(get_current_user)):
    """Retorna la informacion del usuario que posee el token."""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name or "",
        subscription_status=current_user.subscription_status or "inactive",
        subscription_plan=current_user.subscription_plan,
    )
