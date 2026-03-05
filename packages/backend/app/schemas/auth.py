"""Schemas Pydantic para autenticación."""

from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(default="", max_length=255)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str  # user_id


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    subscription_status: str
    subscription_plan: str | None = None

    model_config = {"from_attributes": True}
