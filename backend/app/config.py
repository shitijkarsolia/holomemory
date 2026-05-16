from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "holomemory.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

HRR_DIMENSION = 1024
HRR_SEED = 42
