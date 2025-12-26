"""
Player-level analysis for Valorant scouting reports.
Extracts agent pools, KDA, and individual tendencies.
"""
from typing import Optional
from dataclasses import dataclass, field
from collections import defaultdict


@dataclass
class PlayerStats:
    """Individual player statistics."""
    player_id: str
    player_name: str
    team_id: str
    
    # Agent stats
    agents_played: dict = field(default_factory=dict)  # agent_name -> count
    agent_wins: dict = field(default_factory=dict)  # agent_name -> wins
    
    # Performance stats
    total_kills: int = 0
    total_deaths: int = 0
    total_assists: int = 0
    total_rounds: int = 0
    
    # Special stats
    first_bloods: int = 0
    clutches_won: int = 0
    clutches_played: int = 0
    
    @property
    def kda(self) -> float:
        if self.total_deaths == 0:
            return float(self.total_kills + self.total_assists)
        return (self.total_kills + self.total_assists) / self.total_deaths
    
    @property
    def kills_per_round(self) -> float:
        if self.total_rounds == 0:
            return 0.0
        return self.total_kills / self.total_rounds
    
    @property
    def deaths_per_round(self) -> float:
        if self.total_rounds == 0:
            return 0.0
        return self.total_deaths / self.total_rounds
    
    @property
    def first_blood_rate(self) -> float:
        if self.total_rounds == 0:
            return 0.0
        return self.first_bloods / self.total_rounds
    
    @property
    def clutch_rate(self) -> float:
        if self.clutches_played == 0:
            return 0.0
        return self.clutches_won / self.clutches_played
    
    def get_main_agents(self, top_n: int = 3) -> list[dict]:
        """Get most played agents."""
        sorted_agents = sorted(
            self.agents_played.items(), 
            key=lambda x: -x[1]
        )[:top_n]
        
        result = []
        for agent, count in sorted_agents:
            total = sum(self.agents_played.values())
            wins = self.agent_wins.get(agent, 0)
            win_rate = wins / count if count > 0 else 0
            
            result.append({
                "agent": agent,
                "games": count,
                "pick_rate": round(count / total * 100, 1) if total > 0 else 0,
                "win_rate": round(win_rate * 100, 1)
            })
        
        return result
    
    def to_dict(self) -> dict:
        return {
            "player_id": self.player_id,
            "player_name": self.player_name,
            "kda": round(self.kda, 2),
            "kills_per_round": round(self.kills_per_round, 2),
            "deaths_per_round": round(self.deaths_per_round, 2),
            "first_blood_rate": round(self.first_blood_rate * 100, 1),
            "clutch_rate": round(self.clutch_rate * 100, 1),
            "main_agents": self.get_main_agents(),
            "total_games": sum(self.agents_played.values())
        }


class PlayerAnalyzer:
    """Analyzes player performance from match data."""
    
    def __init__(self, team_id: str):
        self.team_id = team_id
        self.players: dict[str, PlayerStats] = {}
    
    def add_game_data(self, game: dict, player_data: Optional[dict] = None) -> None:
        """
        Add game data for analysis.
        
        Args:
            game: Game data from GRID API
            player_data: Optional detailed player stats (if available)
        """
        if not game:
            return
        
        # Extract team info from game
        game_teams = game.get("teams", [])
        for team_participant in game_teams:
            base_info = team_participant.get("baseInfo", {})
            if str(base_info.get("id")) == str(self.team_id):
                team_won = team_participant.get("won", False)
                
                # Process players if available
                players = team_participant.get("players", [])
                for player in players:
                    self._process_player(player, team_won, game)
                break
    
    def _process_player(self, player: dict, team_won: bool, game: dict) -> None:
        """Process individual player stats."""
        player_id = str(player.get("id", player.get("playerId", "")))
        player_name = player.get("name", player.get("nickname", "Unknown"))
        
        if not player_id:
            return
        
        # Initialize player stats if needed
        if player_id not in self.players:
            self.players[player_id] = PlayerStats(
                player_id=player_id,
                player_name=player_name,
                team_id=self.team_id
            )
        
        stats = self.players[player_id]
        
        # Get agent if available
        agent = player.get("agent", {})
        agent_name = agent.get("name") if isinstance(agent, dict) else str(agent)
        
        if agent_name:
            stats.agents_played[agent_name] = stats.agents_played.get(agent_name, 0) + 1
            if team_won:
                stats.agent_wins[agent_name] = stats.agent_wins.get(agent_name, 0) + 1
        
        # Update performance stats if available
        stats.total_kills += player.get("kills", 0)
        stats.total_deaths += player.get("deaths", 0)
        stats.total_assists += player.get("assists", 0)
        stats.first_bloods += player.get("firstBloods", player.get("firstKills", 0))
        
        # Estimate rounds (Valorant maps usually have 13-24 rounds)
        game_score = 0
        for team in game.get("teams", []):
            game_score += team.get("score", 0)
        stats.total_rounds += game_score if game_score > 0 else 24  # Default estimate
    
    def add_series_data(self, series: dict) -> None:
        """Process all games in a series."""
        games = series.get("games", [])
        for game in games:
            self.add_game_data(game)
    
    def get_all_player_stats(self) -> list[dict]:
        """Get stats for all players."""
        return [p.to_dict() for p in self.players.values()]
    
    def get_player_stats(self, player_id: str) -> Optional[dict]:
        """Get stats for a specific player."""
        player = self.players.get(player_id)
        return player.to_dict() if player else None
    
    def get_team_agent_pool(self) -> dict:
        """Get aggregated agent pool for the team."""
        agent_counts = defaultdict(int)
        agent_wins = defaultdict(int)
        
        for player in self.players.values():
            for agent, count in player.agents_played.items():
                agent_counts[agent] += count
                agent_wins[agent] += player.agent_wins.get(agent, 0)
        
        pool = []
        total_games = sum(agent_counts.values())
        
        for agent, count in sorted(agent_counts.items(), key=lambda x: -x[1]):
            wins = agent_wins[agent]
            pool.append({
                "agent": agent,
                "picks": count,
                "pick_rate": round(count / total_games * 100, 1) if total_games > 0 else 0,
                "win_rate": round(wins / count * 100, 1) if count > 0 else 0
            })
        
        return {
            "agents": pool,
            "total_picks": total_games,
            "unique_agents": len(agent_counts)
        }
    
    def get_star_player(self) -> Optional[dict]:
        """Identify the star player based on KDA and impact."""
        if not self.players:
            return None
        
        # Simple scoring: KDA + first blood rate
        best_player = None
        best_score = 0
        
        for player in self.players.values():
            if sum(player.agents_played.values()) < 2:  # Need at least 2 games
                continue
            
            score = player.kda + (player.first_blood_rate * 10)
            if score > best_score:
                best_score = score
                best_player = player
        
        return best_player.to_dict() if best_player else None
    
    def get_weak_link(self) -> Optional[dict]:
        """Identify potential weak link based on deaths and impact."""
        if not self.players:
            return None
        
        worst_player = None
        worst_score = float('inf')
        
        for player in self.players.values():
            if sum(player.agents_played.values()) < 2:
                continue
            
            # Lower score = more deaths, less impact
            score = player.kda
            if score < worst_score:
                worst_score = score
                worst_player = player
        
        return worst_player.to_dict() if worst_player else None
