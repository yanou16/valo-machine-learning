import json
from pathlib import Path
from datetime import datetime
from typing import Optional

from clients.grid_client import GridClient
from clients.file_download import FileDownloadClient


class DataService:
    """Orchestrates data ingestion from GRID APIs."""
    
    def __init__(self, data_dir: Optional[Path] = None):
        self.grid_client = GridClient()
        self.file_client = FileDownloadClient()
        self.data_dir = data_dir or Path(__file__).parent.parent.parent / "data"
    
    async def ingest_team_data(
        self, 
        team_name: str, 
        num_matches: int = 20
    ) -> dict:
        """
        Ingest all relevant data for a team.
        
        Returns:
            dict with team info, series list, and downloaded files
        """
        result = {
            "team": None,
            "series": [],
            "files_downloaded": [],
            "timestamp": datetime.now().isoformat()
        }
        
        # 1. Search for the team
        teams = await self.grid_client.search_team(team_name)
        if not teams:
            raise ValueError(f"Team not found: {team_name}")
        
        # Find best match (prefer Valorant teams)
        team = None
        for t in teams:
            if t.get("title", {}).get("name", "").lower() == "valorant":
                team = t
                break
        
        # If no Valorant team found, take first result
        if team is None:
            team = teams[0]
        
        result["team"] = team
        
        # 2. Get recent Valorant series for the team
        series_list = await self.grid_client.get_valorant_team_series(
            team_id=team["id"],
            limit=num_matches
        )
        
        # 3. Get detailed info for each series
        for series in series_list[:num_matches]:
            try:
                details = await self.grid_client.get_series_details(series["id"])
                if details:
                    result["series"].append(details)
            except Exception as e:
                print(f"Error getting series details: {e}")
        
        # 4. Save metadata
        await self._save_metadata(team_name, result)
        
        return result
    
    async def download_match_data(
        self, 
        team_name: str,
        series_ids: list[str]
    ) -> list[Path]:
        """Download gameplay files for specified series."""
        downloaded = []
        
        team_dir = self.data_dir / "raw" / self._sanitize_name(team_name)
        team_dir.mkdir(parents=True, exist_ok=True)
        
        for series_id in series_ids:
            try:
                files = await self.file_client.download_series_data(
                    series_id,
                    save_dir=team_dir / series_id
                )
                downloaded.extend(files)
            except Exception as e:
                print(f"Error downloading series {series_id}: {e}")
        
        return downloaded
    
    async def _save_metadata(self, team_name: str, data: dict) -> Path:
        """Save ingestion metadata to JSON."""
        metadata_dir = self.data_dir / "metadata"
        metadata_dir.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{self._sanitize_name(team_name)}_{timestamp}.json"
        filepath = metadata_dir / filename
        
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, default=str)
        
        return filepath
    
    @staticmethod
    def _sanitize_name(name: str) -> str:
        """Sanitize team name for filesystem."""
        return name.lower().replace(" ", "_").replace("/", "_")
