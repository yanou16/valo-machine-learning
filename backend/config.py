import os
from functools import lru_cache
from dotenv import load_dotenv

# Load .env file from parent directory
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))


class Settings:
    """Application settings loaded from environment variables."""
    
    def __init__(self):
        # GRID API
        self.grid_api_key = os.getenv("GRID_API_KEY", "")
        self.grid_central_data_url = os.getenv(
            "GRID_CENTRAL_DATA_URL", 
            "https://api-op.grid.gg/central-data/graphql"
        )
        self.grid_stats_feed_url = os.getenv(
            "GRID_STATS_FEED_URL",
            "https://api-op.grid.gg/stats-feed/graphql"
        )
        self.grid_file_download_url = os.getenv(
            "GRID_FILE_DOWNLOAD_URL",
            "https://api.grid.gg/file-download"
        )
        self.grid_live_data_url = os.getenv(
            "GRID_LIVE_DATA_URL",
            "https://api-op.grid.gg/live-data-feed/series-state/graphql"
        )
        
        # App settings
        self.app_name = "ValoML Scouting Report Generator"
        self.debug = os.getenv("DEBUG", "true").lower() == "true"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
