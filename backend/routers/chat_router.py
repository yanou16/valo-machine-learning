"""
Chat Router - AI-powered chat assistant for team analysis.
Auto-fetches team data if not provided in context.
"""
from dataclasses import asdict
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from clients.grid_client import GridClient
from clients.groq_client import GroqClient
from analysis.team_analyzer import TeamAnalyzer


router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str
    context_data: Optional[dict] = None  # Team stats context
    team_name: Optional[str] = None  # If no context, we'll fetch for this team


class ChatResponse(BaseModel):
    response: str
    has_context: bool
    team_name: Optional[str] = None


async def _fetch_team_context(team_name: str) -> dict:
    """Fetch team stats from GRID for chat context."""
    grid_client = GridClient()
    
    try:
        teams = await grid_client.search_team(team_name)
        if not teams:
            return {"team_name": team_name, "error": "Team not found in database"}
        
        team = None
        for t in teams:
            if t.get("title", {}).get("name", "").lower() == "valorant":
                team = t
                break
        if team is None:
            team = teams[0]
        
        series_list = await grid_client.get_valorant_team_series(team["id"], limit=50)
        if not series_list:
            return {"team_name": team["name"], "error": "No matches found for this team"}
        
        # Analyze recent matches
        analyzer = TeamAnalyzer(team_id=team["id"], team_name=team["name"])
        match_count = 0
        
        for series_meta in series_list[:10]:  # Last 10 series
            series_state = await grid_client.get_series_state(series_meta["id"])
            if series_state and series_state.get("games"):
                analyzer.add_series(series_state, series_meta)
                match_count += 1
        
        if match_count == 0:
            return {"team_name": team["name"], "error": "No detailed match data available"}
        
        # Get stats using to_dict() for computed values
        stats = analyzer.get_stats().to_dict()
        stats["matches_analyzed"] = match_count
        
        return stats
        
    except Exception as e:
        return {"team_name": team_name, "error": str(e)}


@router.post("", response_model=ChatResponse)
async def chat_with_analyst(request: ChatRequest):
    """
    Chat with the AI analyst about team strategies.
    
    If context_data is provided, use it. Otherwise, if team_name is provided,
    auto-fetch the team's stats from GRID API.
    """
    try:
        groq = GroqClient()
        
        # Determine context
        context_data = request.context_data
        team_name = None
        
        # If we have full context from report, use it
        if context_data and context_data.get("series_win_rate") is not None:
            team_name = context_data.get("team_name", "the analyzed team")
        
        # If we only have team_name (from chat widget selector), fetch data
        elif context_data and context_data.get("team_name") and not context_data.get("series_win_rate"):
            team_name = context_data.get("team_name")
            context_data = await _fetch_team_context(team_name)
        
        # If team_name provided directly
        elif request.team_name:
            team_name = request.team_name
            context_data = await _fetch_team_context(team_name)
        
        # Build response based on context
        if context_data and not context_data.get("error"):
            stats_summary = _build_stats_summary(context_data)
            
            system_prompt = f"""You are an elite Valorant Esports Analyst named "ValoML Assistant". You have access to detailed statistics for {team_name}.

TEAM DATA:
{stats_summary}

INSTRUCTIONS:
- Answer the user's question based strictly on this data.
- Be concise, tactical, and confident.
- Use specific numbers and percentages from the data.
- If asked about something not in the data, say "I don't have that specific data, but based on what I know..."
- Keep responses under 150 words unless more detail is needed.
- Use bullet points for lists.
- Be conversational but professional."""

            response = await groq.generate(
                prompt=request.message,
                system_prompt=system_prompt,
                max_tokens=500,
                temperature=0.7
            )
            
            return ChatResponse(response=response, has_context=True, team_name=team_name)
        
        elif context_data and context_data.get("error"):
            # We tried to fetch but failed
            error_msg = context_data.get("error")
            system_prompt = f"""You are ValoML Assistant. The user asked about {team_name}, but we encountered an issue: {error_msg}.

Politely explain that you couldn't fetch the team's data and suggest they:
1. Check the team name spelling
2. Try generating a full report from the main page
3. Ask about a different team

Be helpful and friendly."""

            response = await groq.generate(
                prompt=request.message,
                system_prompt=system_prompt,
                max_tokens=300,
                temperature=0.7
            )
            
            return ChatResponse(response=response, has_context=False, team_name=team_name)
        
        else:
            # No context at all - general help mode
            system_prompt = """You are ValoML Assistant, an AI analyst for Valorant esports.

The user hasn't selected a team or generated a report yet. You can:
1. Explain what ValoML does (AI-powered scouting reports for Valorant teams)
2. Guide them to select a team in the chat widget or generate a report
3. Answer general Valorant esports questions

Be friendly and helpful. Keep responses concise."""

            response = await groq.generate(
                prompt=request.message,
                system_prompt=system_prompt,
                max_tokens=300,
                temperature=0.7
            )
            
            return ChatResponse(response=response, has_context=False)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _build_stats_summary(data: dict) -> str:
    """Build a readable summary of team stats for the AI context."""
    lines = []
    
    # Basic info
    team_name = data.get("team_name", "Unknown")
    lines.append(f"Team: {team_name}")
    
    # Matches analyzed
    matches = data.get("matches_analyzed", data.get("total_series", 0))
    lines.append(f"Matches Analyzed: {matches}")
    
    # Series stats
    series_wr = data.get("series_win_rate", 0)
    series_wins = data.get("series_wins", 0)
    series_losses = data.get("series_losses", 0)
    lines.append(f"Series Record: {series_wins}W-{series_losses}L ({series_wr}% win rate)")
    
    # Map stats
    map_wr = data.get("map_win_rate", 0)
    map_wins = data.get("map_wins", 0)
    map_losses = data.get("map_losses", 0)
    lines.append(f"Map Record: {map_wins}W-{map_losses}L ({map_wr}% win rate)")
    
    # Per-map breakdown
    map_stats = data.get("map_stats", [])
    if map_stats:
        lines.append("\nMap Performance:")
        for m in map_stats[:7]:  # Top 7 maps
            if isinstance(m, dict):
                map_name = m.get("map", "Unknown")
                wins = m.get("wins", 0)
                losses = m.get("losses", 0)
                wr = m.get("win_rate", 0)
                lines.append(f"  - {map_name}: {wins}W-{losses}L ({wr}%)")
    
    # Insights if available
    insights = data.get("insights", [])
    if insights:
        lines.append("\nKey Insights:")
        for insight in insights[:5]:
            if isinstance(insight, dict):
                lines.append(f"  - {insight.get('insight', insight)}")
            else:
                lines.append(f"  - {insight}")
    
    # Top opponents
    opponents = data.get("top_opponents", [])
    if opponents:
        lines.append("\nRecent Opponents:")
        for opp in opponents[:5]:
            if isinstance(opp, dict):
                name = opp.get("name", "Unknown")
                matches = opp.get("matches", 0)
                opp_wr = opp.get("win_rate", 0)
                lines.append(f"  - vs {name}: {matches} matches ({opp_wr}% win rate)")
    
    return "\n".join(lines)
