from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    gemini_api_key: str
    kafka_bootstrap_servers: str = "localhost:9092"

    base_dir: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    policy_dir:str = os.path.join(base_dir,"violation_policies")
    db_dir: str = os.path.join(base_dir,"db")

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

settings = Settings()