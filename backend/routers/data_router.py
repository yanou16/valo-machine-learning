from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from pydantic import BaseModel

from clients.grid_client import GridClient
from clients.file_download import FileDownloadClient
from services.data_service import DataService


router = APIRouter(prefix="/api/data", tags=["Data Ingestion"])


# Pydantic models for request/response
class TeamSearchResponse(BaseModel):
    teams: list[dict]
    count: int


class TeamDataRequest(BaseModel):
    team_name: str
    num_matches: int = 20


class TeamDataResponse(BaseModel):
    team: dict
    series: list[dict]
    timestamp: str


# ----- Endpoints -----

@router.get("/teams/search")
async def search_teams(
    q: str = Query(..., description="Team name to search for", min_length=2)
):
    """
    Search for teams by name.
    Returns a list of matching teams from GRID.
    """
    client = GridClient()
    try:
        teams = await client.search_team(q)
        return {"teams": teams, "count": len(teams)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/teams/{team_id}/series")
async def get_team_series(
    team_id: str,
    limit: int = Query(20, ge=1, le=50, description="Number of recent matches"),
    valorant_only: bool = Query(True, description="Filter for Valorant matches only")
):
    """
    Get recent series (matches) for a team.
    """
    client = GridClient()
    try:
        if valorant_only:
            series = await client.get_valorant_team_series(
                team_id=team_id,
                limit=limit
            )
        else:
            series = await client.get_team_series(
                team_id=team_id,
                limit=limit
            )
        return {"series": series, "count": len(series)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/series/{series_id}")
async def get_series_details(series_id: str):
    """
    Get detailed information about a specific series/match.
    """
    client = GridClient()
    try:
        details = await client.get_series_details(series_id)
        if not details:
            raise HTTPException(status_code=404, detail="Series not found")
        return details
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/series/{series_id}/files")
async def list_series_files(series_id: str):
    """
    List available gameplay files for a series.
    """
    client = FileDownloadClient()
    try:
        files = await client.list_files(series_id)
        return {"files": files, "count": len(files)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ingest")
async def ingest_team_data(request: TeamDataRequest):
    """
    Ingest complete data for a team.
    
    This endpoint:
    1. Searches for the team
    2. Fetches recent Valorant series
    3. Gets detailed match information
    4. Saves metadata to disk
    
    Returns the ingested data summary.
    """
    service = DataService()
    try:
        result = await service.ingest_team_data(
            team_name=request.team_name,
            num_matches=request.num_matches
        )
        return {
            "status": "success",
            "team": result["team"],
            "series_count": len(result["series"]),
            "timestamp": result["timestamp"]
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/titles")
async def get_available_titles():
    """
    Get list of available game titles in GRID.
    Useful for debugging and verification.
    """
    client = GridClient()
    try:
        titles = await client.get_all_titles()
        return {"titles": titles, "count": len(titles)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
