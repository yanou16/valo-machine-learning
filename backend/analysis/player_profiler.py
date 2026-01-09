"""
Player Profiler - High-level player analysis for scouting reports.
Integrates with SpatialEngine to provide actionable player intelligence.
"""
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
from collections import defaultdict

from .spatial_engine import SpatialEngine, SpatialEvent, get_agent_role, AGENT_ROLES


@dataclass
class PlayerProfile:
    """Complete profile for a player including all intel."""
    name: str
    team_name: str = ""
    
    # Agent data
    primary_agent: str = "Unknown"
    agent_pool: List[str] = field(default_factory=list)
    role: str = "Unknown"
    
    # Performance metrics across analyzed matches
    matches_analyzed: int = 0
    total_rounds: int = 0
    total_kills: int = 0
    total_deaths: int = 0
    
    # Opening duel metrics
    opening_kills: int = 0
    opening_deaths: int = 0
    
    # Site-specific data per map
    map_tendencies: Dict[str, Dict] = field(default_factory=dict)
    
    # Overall tendencies
    aggression_score: float = 0.5
    survival_rate: float = 0.5
    
    # Badges calculated from performance
    badges: List[str] = field(default_factory=list)
    
    # Weapon preference
    primary_weapon: str = "Unknown"
    
    def to_dict(self) -> Dict:
        """Convert to the roster_intel JSON format."""
        # Get primary defensive setup from most played map
        primary_setup = self._get_primary_defensive_setup()
        
        return {
            "name": self.name,
            "team": self.team_name,
            "agent": self.primary_agent,
            "role": self.role,
            "agent_pool": self.agent_pool[:4],  # Top 4 agents
            "tendencies": {
                "aggression_score": round(self.aggression_score, 2),
                "survival_rate": round(self.survival_rate, 2),
                "primary_weapon": self.primary_weapon,
                "badges": self.badges[:3],  # Max 3 badges
            },
            "defensive_setup": primary_setup,
            "stats": {
                "matches_analyzed": self.matches_analyzed,
                "kd": round(self.total_kills / max(1, self.total_deaths), 2),
                "opening_duels": self.opening_kills + self.opening_deaths,
                "opening_success": round(
                    self.opening_kills / max(1, self.opening_kills + self.opening_deaths),
                    2
                ),
            },
            "map_tendencies": self.map_tendencies,
        }
    
    def _get_primary_defensive_setup(self) -> Dict:
        """Get the most common defensive setup across maps."""
        if not self.map_tendencies:
            return {
                "map": "Unknown",
                "preferred_site": "Unknown",
                "hold_frequency": "0%"
            }
        
        # Find map with most data
        best_map = None
        best_count = 0
        
        for map_name, data in self.map_tendencies.items():
            count = data.get("defense_events", 0)
            if count > best_count:
                best_count = count
                best_map = map_name
        
        if best_map and self.map_tendencies[best_map].get("preferred_site"):
            return {
                "map": best_map,
                "preferred_site": self.map_tendencies[best_map]["preferred_site"],
                "hold_frequency": self.map_tendencies[best_map].get("hold_frequency", "0%")
            }
        
        return {
            "map": "Unknown",
            "preferred_site": "Unknown",
            "hold_frequency": "0%"
        }


class PlayerProfiler:
    """
    Builds comprehensive player profiles from match data.
    Integrates with SpatialEngine for coordinate-based analysis.
    """
    
    def __init__(self, team_id: str, team_name: str):
        self.team_id = team_id
        self.team_name = team_name
        self.spatial_engine = SpatialEngine()
        self.profiles: Dict[str, PlayerProfile] = {}
        self.matches_processed: int = 0
        
        # Track agent usage per player
        self.agent_usage: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))
        
        # Track weapon usage per player
        self.weapon_usage: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))
    
    def process_match(
        self, 
        match_data: Dict, 
        map_name: str,
        team_players: List[str]
    ):
        """
        Process a single match's data for player profiling.
        
        Args:
            match_data: Full match data from GRID API
            map_name: Name of the map played
            team_players: List of player names on our team
        """
        self.matches_processed += 1
        
        # Ensure all players have profiles
        for player_name in team_players:
            if player_name not in self.profiles:
                self.profiles[player_name] = PlayerProfile(
                    name=player_name,
                    team_name=self.team_name
                )
            self.profiles[player_name].matches_analyzed += 1
        
        # Process rounds if available
        rounds = match_data.get("rounds", [])
        for round_data in rounds:
            self._process_round(round_data, map_name, team_players)
    
    def _process_round(
        self, 
        round_data: Dict, 
        map_name: str, 
        team_players: List[str]
    ):
        """Process a single round's events."""
        round_number = round_data.get("roundNumber", 0)
        events = round_data.get("events", [])
        
        # Track first blood for the round
        first_kill_found = False
        
        # Track who survived this round
        players_alive = {p: True for p in team_players}
        
        for event in events:
            event_type = event.get("type", "").lower()
            
            # Process kill events
            if event_type in ["playerkilled", "kill"]:
                killer = event.get("killer", {})
                victim = event.get("victim", {}) or event.get("killed", {})
                
                killer_name = killer.get("name", "")
                victim_name = victim.get("name", "")
                
                # Get position (could be killer or victim position)
                position = event.get("killerPosition") or event.get("position") or {}
                x = position.get("x", 0)
                y = position.get("y", 0)
                
                # Get weapon
                weapon = event.get("weapon", {})
                weapon_name = weapon.get("name", "Unknown") if isinstance(weapon, dict) else str(weapon)
                
                # Get agent info
                killer_agent = killer.get("agent", {})
                killer_agent_name = killer_agent.get("name", "") if isinstance(killer_agent, dict) else str(killer_agent)
                
                victim_agent = victim.get("agent", {})
                victim_agent_name = victim_agent.get("name", "") if isinstance(victim_agent, dict) else str(victim_agent)
                
                # Determine side
                killer_side = killer.get("teamSide", "unknown")
                victim_side = victim.get("teamSide", "unknown")
                
                is_opening = not first_kill_found
                first_kill_found = True
                
                # Process killer event (if on our team)
                if killer_name in team_players:
                    self._track_kill_event(
                        player_name=killer_name,
                        is_kill=True,
                        is_opening=is_opening,
                        x=x, y=y,
                        map_name=map_name,
                        round_number=round_number,
                        side=killer_side,
                        agent=killer_agent_name,
                        weapon=weapon_name
                    )
                    
                    # Track agent usage
                    if killer_agent_name:
                        self.agent_usage[killer_name][killer_agent_name] += 1
                    
                    # Track weapon usage
                    if weapon_name and weapon_name != "Unknown":
                        self.weapon_usage[killer_name][weapon_name] += 1
                
                # Process victim event (if on our team)
                if victim_name in team_players:
                    players_alive[victim_name] = False
                    
                    victim_pos = event.get("victimPosition") or event.get("position") or {}
                    vx = victim_pos.get("x", 0)
                    vy = victim_pos.get("y", 0)
                    
                    self._track_kill_event(
                        player_name=victim_name,
                        is_kill=False,
                        is_opening=is_opening,
                        x=vx, y=vy,
                        map_name=map_name,
                        round_number=round_number,
                        side=victim_side,
                        agent=victim_agent_name,
                        weapon=None
                    )
                    
                    # Track agent usage
                    if victim_agent_name:
                        self.agent_usage[victim_name][victim_agent_name] += 1
        
        # Update round survival stats
        for player_name, survived in players_alive.items():
            if player_name in self.profiles:
                self.profiles[player_name].total_rounds += 1
    
    def _track_kill_event(
        self,
        player_name: str,
        is_kill: bool,
        is_opening: bool,
        x: float,
        y: float,
        map_name: str,
        round_number: int,
        side: str,
        agent: str,
        weapon: Optional[str]
    ):
        """Track a kill/death event for a player."""
        # Add to spatial engine
        event = SpatialEvent(
            player_name=player_name,
            team_side=side,
            event_type="kill" if is_kill else "death",
            x=x, y=y,
            round_number=round_number,
            map_name=map_name,
            agent=agent,
            weapon=weapon,
            is_opening=is_opening
        )
        self.spatial_engine.add_event(event)
        
        # Update profile stats
        profile = self.profiles.get(player_name)
        if profile:
            if is_kill:
                profile.total_kills += 1
                if is_opening:
                    profile.opening_kills += 1
            else:
                profile.total_deaths += 1
                if is_opening:
                    profile.opening_deaths += 1
        
        # Update map tendencies
        self._update_map_tendencies(player_name, map_name, x, y, side)
    
    def _update_map_tendencies(
        self, 
        player_name: str, 
        map_name: str, 
        x: float, 
        y: float, 
        side: str
    ):
        """Update map-specific tendencies for a player."""
        profile = self.profiles.get(player_name)
        if not profile:
            return
        
        if map_name not in profile.map_tendencies:
            profile.map_tendencies[map_name] = {
                "defense_zones": defaultdict(int),
                "attack_zones": defaultdict(int),
                "defense_events": 0,
                "attack_events": 0,
                "preferred_site": None,
                "hold_frequency": "0%"
            }
        
        zone = self.spatial_engine.get_zone_for_coordinates(x, y, map_name)
        
        if side == "defense":
            profile.map_tendencies[map_name]["defense_zones"][zone] += 1
            profile.map_tendencies[map_name]["defense_events"] += 1
        else:
            profile.map_tendencies[map_name]["attack_zones"][zone] += 1
            profile.map_tendencies[map_name]["attack_events"] += 1
        
        # Recalculate preferred site for defense
        if profile.map_tendencies[map_name]["defense_events"] > 0:
            def_zones = profile.map_tendencies[map_name]["defense_zones"]
            if def_zones:
                best_zone = max(def_zones.items(), key=lambda x: x[1])
                total_def = profile.map_tendencies[map_name]["defense_events"]
                freq = round((best_zone[1] / total_def) * 100)
                profile.map_tendencies[map_name]["preferred_site"] = best_zone[0]
                profile.map_tendencies[map_name]["hold_frequency"] = f"{freq}%"
    
    def finalize_profiles(self):
        """
        Finalize all player profiles with calculated metrics.
        Call this after processing all matches.
        """
        for player_name, profile in self.profiles.items():
            # Calculate aggression score
            if profile.total_rounds > 0:
                opening_rate = (profile.opening_kills + profile.opening_deaths) / profile.total_rounds
                profile.aggression_score = min(1.0, opening_rate / 0.3)
            
            # Calculate survival rate
            if profile.total_rounds > 0 and profile.total_deaths > 0:
                # Approximate survival: rounds where player wasn't killed
                survived = profile.total_rounds - profile.total_deaths
                profile.survival_rate = max(0, survived / profile.total_rounds)
            
            # Set primary agent
            if player_name in self.agent_usage and self.agent_usage[player_name]:
                agents = self.agent_usage[player_name]
                profile.primary_agent = max(agents.items(), key=lambda x: x[1])[0]
                profile.agent_pool = sorted(agents.keys(), key=lambda a: agents[a], reverse=True)
                profile.role = get_agent_role(profile.primary_agent)
            
            # Set primary weapon
            if player_name in self.weapon_usage and self.weapon_usage[player_name]:
                weapons = self.weapon_usage[player_name]
                # Filter out melee/utility
                combat_weapons = {k: v for k, v in weapons.items() 
                                   if k not in ["Melee", "Knife", "knife", "Unknown"]}
                if combat_weapons:
                    profile.primary_weapon = max(combat_weapons.items(), key=lambda x: x[1])[0]
            
            # Generate badges
            profile.badges = self._generate_badges(profile)
    
    def _generate_badges(self, profile: PlayerProfile) -> List[str]:
        """Generate badges based on player metrics."""
        badges = []
        
        # Aggression badges
        if profile.aggression_score >= 0.7:
            badges.append("🦅 FIRST BLOOD")
            badges.append("⚔️ ENTRY FRAGGER")
        elif profile.aggression_score >= 0.5:
            badges.append("💥 AGGRESSIVE")
        elif profile.aggression_score <= 0.2:
            badges.append("🛡️ PASSIVE")
        
        # Survival/anchor badges
        if profile.survival_rate >= 0.6:
            badges.append("🧱 ANCHOR")
        if profile.survival_rate >= 0.65 and profile.aggression_score <= 0.3:
            badges.append("🏰 SITE HOLDER")
        
        # K/D badges
        if profile.total_deaths > 0:
            kd = profile.total_kills / profile.total_deaths
            if kd >= 1.4:
                badges.append("💀 HIGH IMPACT")
            elif kd >= 1.2:
                badges.append("⭐ CONSISTENT")
        
        # Opening duel success
        total_openings = profile.opening_kills + profile.opening_deaths
        if total_openings >= 3:
            success = profile.opening_kills / total_openings
            if success >= 0.65:
                badges.append("🎯 CLUTCH OPENER")
            elif success <= 0.35:
                badges.append("⚠️ OPENING RISK")
        
        # Role-based badges
        if profile.role == "Duelist" and profile.aggression_score >= 0.5:
            badges.append("🔥 TRUE DUELIST")
        elif profile.role == "Sentinel" and profile.survival_rate >= 0.55:
            badges.append("🛡️ LOCKDOWN")
        
        return badges[:4]  # Max 4 badges
    
    def get_roster_intel(self) -> List[Dict]:
        """
        Get the full roster intel for all players.
        Returns the structured JSON format for the frontend.
        """
        self.finalize_profiles()
        
        roster = []
        for profile in self.profiles.values():
            roster.append(profile.to_dict())
        
        # Sort by aggression score descending
        roster.sort(key=lambda x: x["tendencies"]["aggression_score"], reverse=True)
        
        return roster
    
    def get_player_intel(self, player_name: str) -> Optional[Dict]:
        """Get intel for a specific player."""
        self.finalize_profiles()
        
        if player_name in self.profiles:
            return self.profiles[player_name].to_dict()
        return None
