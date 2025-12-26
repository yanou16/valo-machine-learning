from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional

from clients.grid_client import GridClient
from analysis.team_analyzer import TeamAnalyzer
from analysis.insight_generator import InsightGenerator


router = APIRouter(prefix="/api/analysis", tags=["Analysis"])


class AnalyzeTeamRequest(BaseModel):
    team_name: str
    num_matches: int = 20


class AnalyzeTeamResponse(BaseModel):
    team: dict
    stats: dict
    insights: list[dict]
    summary: str
    how_to_win: list[str]


@router.post("/team")
async def analyze_team(request: AnalyzeTeamRequest):
    """
    Analyze a team and generate scouting insights.
    
    This endpoint:
    1. Searches for the team
    2. Fetches recent series from Central Data
    3. Attempts to get detailed game data from Series State API
    4. Falls back to series-level metadata if detailed data unavailable
    5. Generates actionable insights
    
    Note: Series State with detailed game data is only available for CS2/Dota2
    on Open Access. Valorant analysis uses series-level metadata (scoreAdvantage).
    """
    client = GridClient()
    
    try:
        # 1. Search for team
        teams = await client.search_team(request.team_name)
        if not teams:
            raise HTTPException(status_code=404, detail=f"Team not found: {request.team_name}")
        
        # Find Valorant team preferably
        team = None
        for t in teams:
            if t.get("title", {}).get("name", "").lower() == "valorant":
                team = t
                break
        if team is None:
            team = teams[0]
        
        # 2. Get recent series (metadata from Central Data)
        # Fetch many series - recent ones may not have game data yet
        series_list = await client.get_valorant_team_series(
            team_id=team["id"],
            limit=50  # Fetch many to find ones with actual game data
        )
        
        if not series_list:
            raise HTTPException(
                status_code=404, 
                detail=f"No Valorant matches found for {request.team_name}"
            )
        
        # 3. Try to get detailed game data from Series State API
        detailed_series = []
        metadata_list = []
        
        print(f"[DEBUG] Processing {len(series_list)} series for {request.team_name}")
        
        for idx, series_meta in enumerate(series_list):
            if len(detailed_series) >= request.num_matches:
                break
            try:
                series_id = series_meta["id"]
                series_state = await client.get_series_state(series_id)
                games = series_state.get("games", []) if series_state else []
                print(f"[DEBUG] Series {idx+1}/{len(series_list)} (ID:{series_id}): {len(games)} games")
                if series_state and games and len(games) > 0:
                    detailed_series.append(series_state)
                    metadata_list.append(series_meta)
            except Exception as e:
                print(f"[DEBUG] Series {series_meta['id']} error: {e}")
        
        print(f"[DEBUG] Found {len(detailed_series)} series with games")
        
        # 4. If no detailed data, use series-level metadata
        data_source = "series_state"
        if not detailed_series:
            data_source = "metadata_only"
            # Convert series metadata to analyzable format
            for series_meta in series_list[:request.num_matches]:
                # Create pseudo series-state from metadata
                series_teams = series_meta.get("teams", [])
                pseudo_state = {
                    "id": series_meta["id"],
                    "finished": True,
                    "teams": []
                }
                
                # Check if match has actual results (not just 0-0)
                has_winner = False
                for team_data in series_teams:
                    base_info = team_data.get("baseInfo", {})
                    score_adv = team_data.get("scoreAdvantage")
                    
                    # scoreAdvantage > 0 means this team won
                    if score_adv is not None and score_adv > 0:
                        has_winner = True
                    
                    pseudo_state["teams"].append({
                        "name": base_info.get("name", "Unknown"),
                        "score": score_adv if score_adv else 0,
                        "won": score_adv is not None and score_adv > 0
                    })
                
                # Only add finished matches (where someone actually won)
                if pseudo_state["teams"] and has_winner:
                    detailed_series.append(pseudo_state)
                    metadata_list.append(series_meta)
        
        # 5. Analyze team
        team_analyzer = TeamAnalyzer(
            team_id=team["id"],
            team_name=team.get("name", request.team_name)
        )
        team_analyzer.add_series_list(detailed_series, metadata_list)
        
        # 6. Generate insights
        insight_gen = InsightGenerator(team_analyzer=team_analyzer)
        insights = insight_gen.generate_all_insights()
        
        return {
            "team": team,
            "stats": team_analyzer.get_stats_dict(),
            "insights": insights,
            "summary": insight_gen.get_executive_summary(),
            "how_to_win": insight_gen.get_how_to_win(),
            "matches_analyzed": len(detailed_series),
            "data_source": data_source,
            "note": "Valorant detailed game data requires Full Access API. Using series-level metadata." if data_source == "metadata_only" else None
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/team/{team_id}")
async def get_team_analysis(
    team_id: str,
    num_matches: int = Query(20, ge=1, le=50)
):
    """
    Analyze a team by ID.
    """
    client = GridClient()
    
    try:
        series_list = await client.get_valorant_team_series(
            team_id=team_id,
            limit=num_matches
        )
        
        if not series_list:
            raise HTTPException(
                status_code=404,
                detail="No Valorant matches found for this team"
            )
        
        # Get first series to extract team name
        first_series = series_list[0]
        team_name = "Unknown"
        for team in first_series.get("teams", []):
            if str(team.get("baseInfo", {}).get("id")) == str(team_id):
                team_name = team.get("baseInfo", {}).get("name", "Unknown")
                break
        
        # Convert metadata to analyzable format
        detailed_series = []
        metadata_list = []
        
        for series_meta in series_list:
            series_teams = series_meta.get("teams", [])
            pseudo_state = {
                "id": series_meta["id"],
                "finished": True,
                "teams": []
            }
            
            for team_data in series_teams:
                base_info = team_data.get("baseInfo", {})
                score_adv = team_data.get("scoreAdvantage", 0)
                pseudo_state["teams"].append({
                    "name": base_info.get("name", "Unknown"),
                    "score": score_adv if score_adv else 0,
                    "won": score_adv is not None and score_adv > 0
                })
            
            if pseudo_state["teams"]:
                detailed_series.append(pseudo_state)
                metadata_list.append(series_meta)
        
        # Analyze
        team_analyzer = TeamAnalyzer(team_id=team_id, team_name=team_name)
        team_analyzer.add_series_list(detailed_series, metadata_list)
        
        insight_gen = InsightGenerator(team_analyzer=team_analyzer)
        insights = insight_gen.generate_all_insights()
        
        return {
            "team_id": team_id,
            "team_name": team_name,
            "stats": team_analyzer.get_stats_dict(),
            "insights": insights,
            "summary": insight_gen.get_executive_summary(),
            "how_to_win": insight_gen.get_how_to_win(),
            "matches_analyzed": len(detailed_series)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/quick/{team_name}")
async def quick_analysis(
    team_name: str,
    limit: int = Query(10, ge=1, le=20)
):
    """
    Quick analysis endpoint - returns key insights only.
    """
    request = AnalyzeTeamRequest(team_name=team_name, num_matches=limit)
    result = await analyze_team(request)
    
    return {
        "team_name": result["team"]["name"],
        "win_rate": result["stats"]["series_win_rate"],
        "matches_analyzed": result["matches_analyzed"],
        "top_insights": result["insights"][:5],
        "how_to_win": result["how_to_win"][:3]
    }
