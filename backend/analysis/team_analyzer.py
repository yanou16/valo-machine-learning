"""
Team-level analysis for Valorant scouting reports.
Works with Series State API data format (games, maps, scores, winners).
"""
from typing import Optional
from dataclasses import dataclass, field


@dataclass
class TeamStats:
    """Aggregated team statistics."""
    team_id: str
    team_name: str
    total_series: int = 0
    series_wins: int = 0
    series_losses: int = 0
    total_maps: int = 0
    map_wins: int = 0
    map_losses: int = 0
    
    # Map-specific stats
    map_stats: dict = field(default_factory=dict)
    
    # Tournament stats
    tournaments: dict = field(default_factory=dict)
    
    # Opponent stats  
    opponents: dict = field(default_factory=dict)
    
    @property
    def series_win_rate(self) -> float:
        if self.total_series == 0:
            return 0.0
        return self.series_wins / self.total_series
    
    @property
    def map_win_rate(self) -> float:
        if self.total_maps == 0:
            return 0.0
        return self.map_wins / self.total_maps
    
    def to_dict(self) -> dict:
        return {
            "team_id": self.team_id,
            "team_name": self.team_name,
            "total_series": self.total_series,
            "series_wins": self.series_wins,
            "series_losses": self.series_losses,
            "series_win_rate": round(self.series_win_rate * 100, 1),
            "total_maps": self.total_maps,
            "map_wins": self.map_wins,
            "map_losses": self.map_losses,
            "map_win_rate": round(self.map_win_rate * 100, 1),
            "map_stats": self._get_map_stats(),
            "top_opponents": self._get_top_opponents()
        }
    
    def _get_map_stats(self) -> list[dict]:
        """Get map stats sorted by games played."""
        result = []
        for map_name, stats in self.map_stats.items():
            total = stats["wins"] + stats["losses"]
            win_rate = stats["wins"] / total * 100 if total > 0 else 0
            result.append({
                "map": map_name,
                "wins": stats["wins"],
                "losses": stats["losses"],
                "games": total,
                "win_rate": round(win_rate, 1)
            })
        return sorted(result, key=lambda x: -x["games"])
    
    def _get_top_opponents(self, limit: int = 5) -> list[dict]:
        """Get most frequently faced opponents."""
        sorted_opps = sorted(
            self.opponents.items(),
            key=lambda x: x[1]["matches"],
            reverse=True
        )[:limit]
        
        return [
            {
                "name": name,
                "matches": data["matches"],
                "wins": data["wins"],
                "win_rate": round(data["wins"] / data["matches"] * 100, 1) if data["matches"] > 0 else 0
            }
            for name, data in sorted_opps
        ]


class TeamAnalyzer:
    """Analyzes team performance from Series State data."""
    
    def __init__(self, team_id: str, team_name: str):
        self.team_id = str(team_id)
        self.team_name = team_name
        self.stats = TeamStats(team_id=self.team_id, team_name=team_name)
        self.series_data = []
    
    def add_series(self, series_state: dict, metadata: dict = None) -> None:
        """
        Add a series to analyze.
        
        Args:
            series_state: Data from get_series_state (games, maps, scores)
            metadata: Optional metadata from allSeries (tournament name, etc)
        """
        if not series_state:
            return
            
        self.series_data.append(series_state)
        self._process_series(series_state, metadata)
    
    def add_series_list(self, series_list: list[dict], metadata_list: list[dict] = None) -> None:
        """Add multiple series at once."""
        if metadata_list is None:
            metadata_list = [None] * len(series_list)
        for series, metadata in zip(series_list, metadata_list):
            self.add_series(series, metadata)
    
    def _process_series(self, series_state: dict, metadata: dict = None) -> None:
        """Process a single series and update stats."""
        self.stats.total_series += 1
        
        # Get teams from series state
        teams = series_state.get("teams", [])
        if not teams:
            return
        
        team_won_series = False
        opponent_name = None
        
        # Find our team and check if we won
        for team in teams:
            team_name = team.get("name", "")
            
            if self._is_our_team(team_name):
                if team.get("won") == True or team.get("score", 0) > 1:
                    # won=True or score > 1 (won more maps in BO3/BO5)
                    other_scores = [t.get("score", 0) for t in teams if not self._is_our_team(t.get("name", ""))]
                    our_score = team.get("score", 0)
                    if team.get("won") == True or (other_scores and our_score > max(other_scores)):
                        team_won_series = True
            else:
                opponent_name = team_name
        
        # Update win/loss
        if team_won_series:
            self.stats.series_wins += 1
        else:
            self.stats.series_losses += 1
        
        # Track opponent stats
        if opponent_name:
            if opponent_name not in self.stats.opponents:
                self.stats.opponents[opponent_name] = {"matches": 0, "wins": 0}
            self.stats.opponents[opponent_name]["matches"] += 1
            if team_won_series:
                self.stats.opponents[opponent_name]["wins"] += 1
        
        # Track tournament stats from metadata
        if metadata:
            tournament_name = metadata.get("tournament", {}).get("name", "Unknown")
            if tournament_name not in self.stats.tournaments:
                self.stats.tournaments[tournament_name] = {"matches": 0, "wins": 0}
            self.stats.tournaments[tournament_name]["matches"] += 1
            if team_won_series:
                self.stats.tournaments[tournament_name]["wins"] += 1
        
        # Process individual games/maps
        games = series_state.get("games", [])
        for game in games:
            self._process_game(game)
    
    def _is_our_team(self, team_name: str) -> bool:
        """Check if a team name matches our team."""
        return team_name.lower() == self.team_name.lower()
    
    def _process_game(self, game: dict) -> None:
        """Process a single game/map and update stats."""
        self.stats.total_maps += 1
        
        map_name = game.get("map", {}).get("name", "Unknown")
        
        # Initialize map stats if needed
        if map_name not in self.stats.map_stats:
            self.stats.map_stats[map_name] = {"wins": 0, "losses": 0}
        
        # Find our team in the game
        game_teams = game.get("teams", [])
        for team in game_teams:
            if self._is_our_team(team.get("name", "")):
                if team.get("won") == True:
                    self.stats.map_wins += 1
                    self.stats.map_stats[map_name]["wins"] += 1
                else:
                    self.stats.map_losses += 1
                    self.stats.map_stats[map_name]["losses"] += 1
                break
    
    def get_stats(self) -> TeamStats:
        """Get the computed team statistics."""
        return self.stats
    
    def get_stats_dict(self) -> dict:
        """Get stats as dictionary for JSON serialization."""
        return self.stats.to_dict()
    
    def get_weak_maps(self, threshold: float = 0.4) -> list[dict]:
        """Get maps where team has low win rate."""
        result = []
        for item in self.stats._get_map_stats():
            if item["games"] >= 2 and item["win_rate"] < threshold * 100:
                result.append(item)
        return result
    
    def get_strong_maps(self, threshold: float = 0.6) -> list[dict]:
        """Get maps where team has high win rate."""
        result = []
        for item in self.stats._get_map_stats():
            if item["games"] >= 2 and item["win_rate"] >= threshold * 100:
                result.append(item)
        return result
    
    def get_form(self, last_n: int = 5) -> dict:
        """Get recent form (last N matches)."""
        recent = self.series_data[:last_n]
        wins = 0
        
        for series in recent:
            teams = series.get("teams", [])
            for team in teams:
                if self._is_our_team(team.get("name", "")):
                    if team.get("won") == True:
                        wins += 1
                    break
        
        return {
            "last_n": len(recent),
            "wins": wins,
            "losses": len(recent) - wins,
            "win_rate": round(wins / len(recent) * 100, 1) if recent else 0
        }
    
    def get_win_streak(self) -> dict:
        """Analyze win/loss streaks."""
        if not self.series_data:
            return {"current_streak": 0, "streak_type": "none", "best_win_streak": 0}
        
        current_streak = 0
        streak_type = "none"
        best_streak = 0
        temp_streak = 0
        last_result = None
        
        for series in self.series_data:
            teams = series.get("teams", [])
            won = False
            for team in teams:
                if self._is_our_team(team.get("name", "")):
                    won = team.get("won") == True
                    break
            
            result = "win" if won else "loss"
            
            if result == last_result:
                temp_streak += 1
            else:
                temp_streak = 1
            
            if result == "win" and temp_streak > best_streak:
                best_streak = temp_streak
            
            last_result = result
            current_streak = temp_streak
            streak_type = result
        
        return {
            "current_streak": current_streak,
            "streak_type": streak_type,
            "best_win_streak": best_streak
        }
    
    def get_side_preference(self) -> str:
        """Determine if team is attack or defense-preferred."""
        # Note: Side preference requires round-level data from games
        # For now, return unknown
        return "requires detailed round data"
