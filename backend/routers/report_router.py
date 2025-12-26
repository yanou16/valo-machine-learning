"""
Scouting Report Router - Generate LLM-powered scouting reports.
"""
from dataclasses import asdict
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from clients.grid_client import GridClient
from clients.groq_client import GroqClient
from clients.report_generator import ReportGenerator
from analysis.team_analyzer import TeamAnalyzer
from analysis.insight_generator import InsightGenerator


router = APIRouter(prefix="/api/report", tags=["report"])


class ReportRequest(BaseModel):
    team_name: str
    num_matches: int = 5


class ReportResponse(BaseModel):
    team_name: str
    matches_analyzed: int
    report: str
    stats: dict
    insights: list


@router.post("/generate", response_model=ReportResponse)
async def generate_scouting_report(request: ReportRequest):
    """
    Generate a full scouting report for a team using LLM.
    
    This analyzes recent matches and generates an AI-written report
    with strategic insights and recommendations.
    """
    grid_client = GridClient()
    
    try:
        # 1. Search for team
        teams = await grid_client.search_team(request.team_name)
        if not teams:
            raise HTTPException(status_code=404, detail=f"Team not found: {request.team_name}")
        
        # Find Valorant team
        team = None
        for t in teams:
            if t.get("title", {}).get("name", "").lower() == "valorant":
                team = t
                break
        if team is None:
            team = teams[0]
        
        # 2. Get series with game data
        series_list = await grid_client.get_valorant_team_series(
            team_id=team["id"],
            limit=50
        )
        
        if not series_list:
            raise HTTPException(
                status_code=404, 
                detail=f"No Valorant matches found for '{request.team_name}' in GRID database. This team may not have recent tracked matches or may not be a Valorant team."
            )
        
        # 3. Get detailed series data
        detailed_series = []
        metadata_list = []
        
        for series_meta in series_list:
            if len(detailed_series) >= request.num_matches:
                break
            series_state = await grid_client.get_series_state(series_meta["id"])
            games = series_state.get("games", []) if series_state else []
            if series_state and games:
                detailed_series.append(series_state)
                metadata_list.append(series_meta)
        
        if not detailed_series:
            raise HTTPException(
                status_code=404,
                detail=f"No match data available for {request.team_name}"
            )
        
        # 4. Analyze
        analyzer = TeamAnalyzer(team_id=team["id"], team_name=team["name"])
        for series_state, series_meta in zip(detailed_series, metadata_list):
            analyzer.add_series(series_state, series_meta)
        
        stats = asdict(analyzer.get_stats())
        
        # 5. Generate insights
        insight_gen = InsightGenerator(analyzer)
        insights = insight_gen.generate_all_insights()
        how_to_win = insight_gen.get_how_to_win()
        
        # 6. Generate LLM report
        groq = GroqClient()
        report_gen = ReportGenerator(groq)
        
        report = await report_gen.generate_scouting_report(
            team_name=team["name"],
            stats=stats,
            insights=insights,
            how_to_win=how_to_win,
            num_matches=len(detailed_series)
        )
        
        return ReportResponse(
            team_name=team["name"],
            matches_analyzed=len(detailed_series),
            report=report,
            stats=stats,
            insights=insights
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/quick-summary")
async def generate_quick_summary(request: ReportRequest):
    """Generate a quick 2-3 sentence summary of a team."""
    grid_client = GridClient()
    
    try:
        # Get team and analyze
        teams = await grid_client.search_team(request.team_name)
        if not teams:
            raise HTTPException(status_code=404, detail="Team not found")
        
        team = teams[0]
        for t in teams:
            if t.get("title", {}).get("name", "").lower() == "valorant":
                team = t
                break
        
        series_list = await grid_client.get_valorant_team_series(team["id"], 30)
        
        # Get stats
        analyzer = TeamAnalyzer(team["name"], team["id"])
        for series_meta in series_list[:request.num_matches]:
            series_state = await grid_client.get_series_state(series_meta["id"])
            if series_state and series_state.get("games"):
                analyzer.add_series(series_state, series_meta)
        
        stats = analyzer.get_stats()
        
        # Quick summary
        groq = GroqClient()
        report_gen = ReportGenerator(groq)
        summary = await report_gen.generate_quick_summary(team["name"], stats)
        
        return {"team_name": team["name"], "summary": summary}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
