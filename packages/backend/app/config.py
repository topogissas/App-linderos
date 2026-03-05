from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    app_name: str = "TopoGIS Linderos API"
    debug: bool = False

    # Database
    database_url: str = "postgresql+asyncpg://topogis:topogis_dev@localhost:5432/topogis_linderos"

    # JWT
    secret_key: str = "CHANGE-ME-in-production-use-a-strong-random-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 horas

    # Stripe
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_price_monthly: str = ""
    stripe_price_annual: str = ""

    # CORS
    frontend_url: str = "http://localhost:3000"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
