"""
Insight generator for Valorant scouting reports.
Converts raw statistics into actionable insights following the format:
Fact → Consequence → Recommendation
"""
from typing import Optional
from dataclasses import dataclass

from .team_analyzer import TeamAnalyzer


@dataclass
class Insight:
    """An actionable insight for the scouting report."""
    category: str  # team, opponent, form
    priority: int  # 1-5, higher = more important
    fact: str
    consequence: str
    recommendation: str
    data: Optional[dict] = None
    
    def to_dict(self) -> dict:
        return {
            "category": self.category,
            "priority": self.priority,
            "fact": self.fact,
            "consequence": self.consequence,
            "recommendation": self.recommendation,
            "data": self.data
        }


class InsightGenerator:
    """Generates actionable insights from team analysis."""
    
    def __init__(self, team_analyzer: TeamAnalyzer):
        self.team_analyzer = team_analyzer
        self.insights: list[Insight] = []
    
    def generate_all_insights(self) -> list[dict]:
        """Generate all insights and return as list of dicts."""
        self.insights = []
        
        # Team-level insights
        self._generate_win_rate_insights()
        self._generate_form_insights()
        self._generate_streak_insights()
        self._generate_opponent_insights()
        
        # Sort by priority
        self.insights.sort(key=lambda x: -x.priority)
        
        return [i.to_dict() for i in self.insights]
    
    def _generate_win_rate_insights(self) -> None:
        """Generate insights about overall win rates."""
        stats = self.team_analyzer.stats
        
        if stats.total_series < 3:
            return
        
        win_rate = stats.series_win_rate
        
        # Low win rate
        if win_rate < 0.4:
            self.insights.append(Insight(
                category="team",
                priority=4,
                fact=f"Win rate of {win_rate*100:.0f}% over last {stats.total_series} series",
                consequence="Team is struggling, confidence likely affected",
                recommendation="Apply psychological pressure, force clutch situations",
                data={"win_rate": round(win_rate * 100, 1), "series": stats.total_series}
            ))
        # High win rate
        elif win_rate > 0.7:
            self.insights.append(Insight(
                category="team",
                priority=4,
                fact=f"Strong win rate of {win_rate*100:.0f}% over last {stats.total_series} series",
                consequence="Team is in dominant form with high confidence",
                recommendation="Prepare anti-strats, study their patterns, expect aggressive plays",
                data={"win_rate": round(win_rate * 100, 1), "series": stats.total_series}
            ))
    
    def _generate_form_insights(self) -> None:
        """Generate insights about recent form."""
        form = self.team_analyzer.get_form(5)
        
        if form["last_n"] < 3:
            return
        
        # Hot form
        if form["win_rate"] >= 80:
            self.insights.append(Insight(
                category="form",
                priority=5,
                fact=f"Team is on a hot streak: {form['wins']}W-{form['losses']}L ({form['win_rate']}%) in last {form['last_n']} matches",
                consequence="Team has momentum and high confidence",
                recommendation="Don't let them get early advantages, break their rhythm",
                data=form
            ))
        # Cold form
        elif form["win_rate"] <= 40:
            self.insights.append(Insight(
                category="form",
                priority=5,
                fact=f"Team is struggling: {form['wins']}W-{form['losses']}L ({form['win_rate']}%) in last {form['last_n']} matches",
                consequence="Team morale likely low, prone to tilting",
                recommendation="Aggressive early rounds can snowball their frustration",
                data=form
            ))
    
    def _generate_streak_insights(self) -> None:
        """Generate insights about win/loss streaks."""
        streak = self.team_analyzer.get_win_streak()
        
        if streak["current_streak"] >= 3:
            if streak["streak_type"] == "win":
                self.insights.append(Insight(
                    category="form",
                    priority=4,
                    fact=f"Currently on a {streak['current_streak']}-game win streak",
                    consequence="Team confidence is high, they'll play aggressively",
                    recommendation="Force them into uncomfortable situations, break the pattern",
                    data=streak
                ))
            else:
                self.insights.append(Insight(
                    category="form",
                    priority=4,
                    fact=f"Currently on a {streak['current_streak']}-game losing streak",
                    consequence="Team is tilting, decision-making will be affected",
                    recommendation="Stay calm, let them make mistakes, capitalize on errors",
                    data=streak
                ))
    
    def _generate_opponent_insights(self) -> None:
        """Generate insights about opponents faced."""
        stats = self.team_analyzer.stats
        top_opponents = stats._get_top_opponents(3)
        
        for opp in top_opponents:
            if opp["matches"] >= 2:
                if opp["win_rate"] <= 30:
                    self.insights.append(Insight(
                        category="opponent",
                        priority=3,
                        fact=f"Struggles against {opp['name']}: {opp['win_rate']}% win rate ({opp['wins']}/{opp['matches']})",
                        consequence=f"{opp['name']} has their number - mental block likely",
                        recommendation=f"Study how {opp['name']} plays against them, copy their approach",
                        data=opp
                    ))
                elif opp["win_rate"] >= 70:
                    self.insights.append(Insight(
                        category="opponent",
                        priority=3,
                        fact=f"Dominates {opp['name']}: {opp['win_rate']}% win rate ({opp['wins']}/{opp['matches']})",
                        consequence=f"Very confident against this style of team",
                        recommendation=f"Don't play like {opp['name']} - try different approaches",
                        data=opp
                    ))
    
    def get_executive_summary(self) -> str:
        """Generate a short executive summary."""
        stats = self.team_analyzer.stats
        form = self.team_analyzer.get_form(5)
        
        summary = f"**{stats.team_name}** - {stats.total_series} series analyzed\n\n"
        summary += f"- Overall: {stats.series_wins}W-{stats.series_losses}L ({stats.series_win_rate*100:.0f}% win rate)\n"
        summary += f"- Recent form (last 5): {form['wins']}W-{form['losses']}L ({form['win_rate']}%)\n"
        
        streak = self.team_analyzer.get_win_streak()
        if streak["current_streak"] >= 2:
            summary += f"- Current streak: {streak['current_streak']} {streak['streak_type']}s\n"
        
        return summary
    
    def get_how_to_win(self) -> list[str]:
        """Generate the 'How to win' section."""
        recommendations = []
        
        # Get top insights
        top_insights = sorted(self.insights, key=lambda x: -x.priority)[:5]
        
        for insight in top_insights:
            recommendations.append(insight.recommendation)
        
        # Add default recommendations if not enough
        if len(recommendations) < 3:
            recommendations.append("Study their recent matches for patterns")
            recommendations.append("Focus on your own strengths")
        
        return recommendations[:5]
