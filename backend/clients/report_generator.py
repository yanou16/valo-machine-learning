"""
Scouting Report Generator.
Uses LLM to transform raw stats into actionable insights.
"""
from typing import Optional
from clients.groq_client import GroqClient


SYSTEM_PROMPT = """You are an expert VALORANT esports analyst and coach. 
You write professional scouting reports that help teams prepare for matches.

Your reports are:
- Data-driven and specific
- Actionable with clear recommendations
- Professional but engaging
- Focused on exploitable patterns

Format your reports in clean Markdown with sections."""


class ReportGenerator:
    """Generate scouting reports using LLM."""
    
    def __init__(self, groq_client: Optional[GroqClient] = None):
        self.llm = groq_client or GroqClient()
    
    async def generate_scouting_report(
        self,
        team_name: str,
        stats: dict,
        insights: list,
        how_to_win: list,
        num_matches: int = 5
    ) -> str:
        """
        Generate a full scouting report for a team.
        
        Args:
            team_name: Name of the team
            stats: Team statistics dict
            insights: List of insight dicts
            how_to_win: List of recommendations
            num_matches: Number of matches analyzed
        
        Returns:
            Markdown scouting report
        """
        # Build context from data
        context = self._build_context(team_name, stats, insights, how_to_win, num_matches)
        
        prompt = f"""Generate a professional VALORANT scouting report based on this data:

{context}

Create a complete scouting report with these sections:
1. **Executive Summary** - Quick overview (2-3 sentences)
2. **Team Overview** - Win rates, recent form
3. **Map Analysis** - Best/worst maps with specific stats
4. **Strategic Patterns** - Common strategies and tendencies
5. **Key Matchups** - Performance vs specific opponents
6. **Exploitable Weaknesses** - Areas to target
7. **How to Beat Them** - Specific actionable recommendations

Make it data-driven with specific numbers. Be concise but thorough."""

        report = await self.llm.generate(prompt, SYSTEM_PROMPT)
        return report
    
    def _build_context(
        self,
        team_name: str,
        stats: dict,
        insights: list,
        how_to_win: list,
        num_matches: int
    ) -> str:
        """Build context string from data."""
        lines = [f"# Team: {team_name}", f"Matches analyzed: {num_matches}", ""]
        
        # Core stats
        lines.append("## Statistics")
        lines.append(f"- Series: {stats.get('series_wins', 0)}W-{stats.get('series_losses', 0)}L ({stats.get('series_win_rate', 0)}%)")
        lines.append(f"- Maps: {stats.get('map_wins', 0)}W-{stats.get('map_losses', 0)}L ({stats.get('map_win_rate', 0)}%)")
        lines.append(f"- Recent form (last 5): {stats.get('last_5_form', 'N/A')}")
        lines.append(f"- Win streak: {stats.get('win_streak', 0)}")
        lines.append("")
        
        # Map stats - map_stats is a dict {map_name: {wins, losses}}
        map_stats = stats.get('map_stats', {})
        if map_stats and isinstance(map_stats, dict):
            lines.append("## Map Performance")
            for map_name, map_data in list(map_stats.items())[:6]:
                if isinstance(map_data, dict):
                    wins = map_data.get('wins', 0)
                    losses = map_data.get('losses', 0)
                    total = wins + losses
                    win_rate = round(wins / total * 100, 1) if total > 0 else 0
                    lines.append(f"- {map_name}: {wins}W-{losses}L ({win_rate}%)")
            lines.append("")
        
        # Opponents - opponents is a dict {opponent_name: {wins, losses}}
        opponents = stats.get('opponents', {})
        if opponents and isinstance(opponents, dict):
            lines.append("## vs Opponents")
            for opp_name, opp_data in list(opponents.items())[:5]:
                if isinstance(opp_data, dict):
                    wins = opp_data.get('wins', 0)
                    matches = opp_data.get('wins', 0) + opp_data.get('losses', 0)
                    lines.append(f"- vs {opp_name}: {wins}/{matches} wins")
            lines.append("")
        
        # Insights
        if insights:
            lines.append("## Key Insights")
            for i in insights[:8]:
                lines.append(f"- [{i.get('priority', 'medium')}] {i.get('fact', '')}")
            lines.append("")
        
        # How to win
        if how_to_win:
            lines.append("## Initial Recommendations")
            for h in how_to_win[:5]:
                lines.append(f"- {h}")
        
        return "\n".join(lines)
    
    async def generate_quick_summary(self, team_name: str, stats: dict) -> str:
        """Generate a quick 2-3 sentence summary."""
        prompt = f"""In 2-3 sentences, summarize this VALORANT team's performance:

Team: {team_name}
Series: {stats.get('series_wins', 0)}W-{stats.get('series_losses', 0)}L ({stats.get('series_win_rate', 0)}%)
Maps: {stats.get('map_wins', 0)}W-{stats.get('map_losses', 0)}L ({stats.get('map_win_rate', 0)}%)
Recent form: {stats.get('last_5_form', 'N/A')}

Be specific and mention key strengths/weaknesses."""

        return await self.llm.generate(prompt, SYSTEM_PROMPT, max_tokens=200)
