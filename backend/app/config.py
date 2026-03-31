"""Application configuration."""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Load settings from environment variables."""

    model_config = SettingsConfigDict(env_prefix="JANEQ_")

    # Override for Docker: set JANEQ_REPO_ROOT to project root (contains data/ and exports/).
    repo_root: Path | None = None
    questions_path: Path | None = None
    exports_dir: Path | None = None

    def model_post_init(self, __context: object) -> None:
        root = self.repo_root or Path(__file__).resolve().parent.parent.parent
        object.__setattr__(self, "repo_root", root)
        if self.questions_path is None:
            object.__setattr__(self, "questions_path", root / "data" / "questions_en.json")
        if self.exports_dir is None:
            object.__setattr__(self, "exports_dir", root / "exports")


settings = Settings()
