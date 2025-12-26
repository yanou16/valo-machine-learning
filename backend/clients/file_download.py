import httpx
import json
from pathlib import Path
from typing import Optional
from config import get_settings


class FileDownloadClient:
    """REST client for GRID File Download API."""
    
    def __init__(self):
        self.settings = get_settings()
        self.base_url = self.settings.grid_file_download_url
        self.headers = {
            "x-api-key": self.settings.grid_api_key
        }
    
    async def list_files(self, series_id: str) -> list[dict]:
        """List available files for a series."""
        url = f"{self.base_url}/list/{series_id}"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                url,
                headers=self.headers,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    
    async def download_file(
        self, 
        series_id: str, 
        filename: str,
        save_dir: Optional[Path] = None
    ) -> Path:
        """Download a gameplay file for a series."""
        url = f"{self.base_url}/download/{series_id}/{filename}"
        
        if save_dir is None:
            save_dir = Path("../data/raw") / series_id
        
        save_dir.mkdir(parents=True, exist_ok=True)
        save_path = save_dir / filename
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                url,
                headers=self.headers,
                timeout=120.0  # Large files may take time
            )
            response.raise_for_status()
            
            # Save the file
            save_path.write_bytes(response.content)
        
        return save_path
    
    async def download_series_data(
        self, 
        series_id: str,
        save_dir: Optional[Path] = None
    ) -> list[Path]:
        """Download all gameplay files for a series."""
        files = await self.list_files(series_id)
        downloaded = []
        
        for file_info in files:
            filename = file_info.get("name") or file_info.get("filename")
            if filename:
                path = await self.download_file(series_id, filename, save_dir)
                downloaded.append(path)
        
        return downloaded
