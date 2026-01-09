"""
Spatial Analysis Engine for Valorant Map Coordinates.
Calculates player site anchoring and zone distributions from GRID API events.
"""
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, field
from collections import defaultdict
import math


# ============ MAP COORDINATE DEFINITIONS ============
# These bounding boxes define site zones based on Valorant's coordinate system
# Format: (min_x, max_x, min_y, max_y)
# Note: Coordinates are approximate and based on typical pro match data

MAP_ZONES: Dict[str, Dict[str, Tuple[float, float, float, float]]] = {
    "Haven": {
        "A Site": (-4000, -1500, 2000, 5000),      # A Site area
        "B Site": (-500, 1500, 3500, 5500),        # B Site area  
        "C Site": (1500, 4500, 2000, 5000),        # C Site area
        "A Long": (-5000, -3500, -500, 2000),      # A Long approach
        "C Long": (3000, 5500, -500, 2000),        # C Long approach
        "Mid": (-1500, 1500, 0, 3500),             # Mid area
        "Garage": (-500, 1500, -2000, 500),        # Garage/CT area
        "CT Spawn": (-1000, 1000, 4500, 6500),     # CT Spawn
        "T Spawn": (-1000, 1000, -4000, -2000),    # T Spawn
    },
    "Ascent": {
        "A Site": (-3500, -1000, 2000, 4500),      # A Site
        "B Site": (1000, 4000, 2000, 5000),        # B Site
        "A Main": (-4500, -2500, -1000, 2000),     # A Main approach
        "B Main": (2000, 4500, -1000, 2000),       # B Main approach
        "Mid": (-1500, 1500, -500, 3000),          # Mid area
        "Catwalk": (-500, 500, 2500, 4000),        # Mid Catwalk
        "CT Spawn": (-500, 500, 4000, 6000),       # CT Spawn
        "T Spawn": (-500, 500, -4000, -2000),      # T Spawn
    },
    "Lotus": {
        "A Site": (-4500, -2000, 2500, 5500),      # A Site
        "B Site": (-1500, 1500, 3000, 6000),       # B Site
        "C Site": (2000, 5000, 2500, 5500),        # C Site
        "A Main": (-5000, -3000, 0, 2500),         # A Main
        "B Main": (-1000, 1000, 0, 3000),          # B Main
        "C Main": (3000, 5000, 0, 2500),           # C Main
        "Mid": (-1500, 1500, 1000, 3000),          # Mid/Connector
        "CT Spawn": (-500, 500, 5500, 7000),       # CT Spawn
        "T Spawn": (-500, 500, -3000, -1000),      # T Spawn
    },
    "Split": {
        "A Site": (-3500, -1000, 2000, 4500),      # A Site
        "B Site": (1000, 3500, 2000, 4500),        # B Site
        "A Main": (-4000, -2000, -500, 2000),      # A Main
        "B Main": (2000, 4000, -500, 2000),        # B Main
        "Mid": (-1500, 1500, 0, 2500),             # Mid
        "Vent": (-500, 500, 1500, 3000),           # Vent/Connector
        "CT Spawn": (-500, 500, 4000, 5500),       # CT Spawn
        "T Spawn": (-500, 500, -3500, -1500),      # T Spawn
    },
    "Bind": {
        "A Site": (-4000, -1500, 1500, 4000),      # A Site
        "B Site": (1500, 4500, 1500, 4000),        # B Site
        "A Short": (-4500, -2500, -500, 1500),     # A Short
        "A Bath": (-3000, -1500, 500, 2000),       # A Bathroom
        "B Long": (2500, 5000, -500, 1500),        # B Long
        "B Hookah": (1000, 2500, 500, 2000),       # B Hookah
        "CT Spawn": (-500, 500, 3500, 5000),       # CT Spawn (split)
        "T Spawn": (-500, 500, -3000, -1000),      # T Spawn
    },
    "Pearl": {
        "A Site": (-4000, -1500, 2000, 4500),      # A Site
        "B Site": (1500, 4000, 2000, 4500),        # B Site
        "A Main": (-4500, -2500, -500, 2000),      # A Main
        "B Main": (2500, 4500, -500, 2000),        # B Main
        "Mid": (-1500, 1500, 0, 2500),             # Mid
        "Plaza": (-500, 500, 1500, 3000),          # Mid Plaza
        "CT Spawn": (-500, 500, 4000, 5500),       # CT Spawn
        "T Spawn": (-500, 500, -3500, -1500),      # T Spawn
    },
    "Icebox": {
        "A Site": (-3500, -1000, 2500, 5000),      # A Site
        "B Site": (1000, 4000, 2500, 5000),        # B Site
        "A Main": (-4000, -2000, 0, 2500),         # A Main
        "B Main": (2000, 4500, 0, 2500),           # B Main (Yellow)
        "Mid": (-1500, 1500, 500, 3000),           # Mid/Tubes
        "Kitchen": (500, 2000, 1500, 3000),        # Kitchen area
        "CT Spawn": (-500, 500, 4500, 6000),       # CT Spawn
        "T Spawn": (-500, 500, -3000, -1000),      # T Spawn
    },
    "Fracture": {
        "A Site": (-4000, -1500, 2000, 4500),      # A Site
        "B Site": (1500, 4000, 2000, 4500),        # B Site
        "A Main": (-4500, -2500, -500, 2000),      # A Main
        "A Dish": (-3000, -1500, 1000, 2500),      # A Dish
        "B Main": (2500, 4500, -500, 2000),        # B Main
        "B Arcade": (1500, 3000, 1000, 2500),      # B Arcade
        "Mid": (-1500, 1500, 0, 2000),             # Mid/Rope
        "CT Spawn": (-500, 500, 3500, 5000),       # CT Spawn (both sides)
        "T Spawn": (-500, 500, -500, 500),         # T Spawn (center)
    },
    "Sunset": {
        "A Site": (-4000, -1500, 2000, 4500),      # A Site
        "B Site": (1500, 4000, 2000, 4500),        # B Site
        "A Main": (-4500, -2500, -500, 2000),      # A Main
        "B Main": (2500, 4500, -500, 2000),        # B Main
        "Mid": (-1500, 1500, 0, 3000),             # Mid
        "Market": (500, 2000, 1000, 2500),         # Market
        "CT Spawn": (-500, 500, 4000, 5500),       # CT Spawn
        "T Spawn": (-500, 500, -3000, -1000),      # T Spawn
    },
    "Abyss": {
        "A Site": (-4000, -1500, 2000, 4500),      # A Site
        "B Site": (1500, 4000, 2000, 4500),        # B Site  
        "A Main": (-4500, -2500, -500, 2000),      # A Main
        "B Main": (2500, 4500, -500, 2000),        # B Main
        "Mid": (-1500, 1500, 0, 3000),             # Mid
        "CT Spawn": (-500, 500, 4000, 5500),       # CT Spawn
        "T Spawn": (-500, 500, -3000, -1000),      # T Spawn
    },
}

# Site groupings for simplified analysis
SITE_ZONES = ["A Site", "B Site", "C Site", "Mid"]


@dataclass
class SpatialEvent:
    """Represents a combat event with spatial data."""
    player_name: str
    team_side: str  # "attack" or "defense"
    event_type: str  # "kill", "death", "first_blood", etc.
    x: float
    y: float
    round_number: int
    map_name: str
    agent: Optional[str] = None
    weapon: Optional[str] = None
    is_opening: bool = False  # First kill/death of round


@dataclass  
class ZoneDistribution:
    """Distribution of events across zones."""
    zone_counts: Dict[str, int] = field(default_factory=dict)
    total_events: int = 0
    
    def add_event(self, zone: str):
        self.zone_counts[zone] = self.zone_counts.get(zone, 0) + 1
        self.total_events += 1
    
    def get_percentages(self) -> Dict[str, float]:
        if self.total_events == 0:
            return {}
        return {
            zone: round((count / self.total_events) * 100, 1)
            for zone, count in self.zone_counts.items()
        }
    
    def get_primary_zone(self) -> Tuple[str, float]:
        """Returns the zone with highest frequency and its percentage."""
        if not self.zone_counts:
            return ("Unknown", 0.0)
        primary = max(self.zone_counts.items(), key=lambda x: x[1])
        pct = round((primary[1] / self.total_events) * 100, 1) if self.total_events > 0 else 0.0
        return (primary[0], pct)


@dataclass
class PlayerTendencies:
    """Calculated tendencies for a player."""
    name: str
    agent: str = "Unknown"
    role: str = "Unknown"
    
    # Combat metrics
    total_rounds: int = 0
    rounds_survived: int = 0
    opening_duels_taken: int = 0
    opening_duels_won: int = 0
    total_kills: int = 0
    total_deaths: int = 0
    
    # Spatial distribution
    defense_zones: ZoneDistribution = field(default_factory=ZoneDistribution)
    attack_zones: ZoneDistribution = field(default_factory=ZoneDistribution)
    
    # Weapon preference
    weapon_counts: Dict[str, int] = field(default_factory=dict)
    
    @property
    def aggression_score(self) -> float:
        """Calculate aggression score (0-1). High = aggressive entry style."""
        if self.total_rounds == 0:
            return 0.5
        opening_rate = self.opening_duels_taken / self.total_rounds
        # Normalize to 0-1 (typical opening rate is 10-30%)
        return min(1.0, opening_rate / 0.3)
    
    @property
    def survival_rate(self) -> float:
        """Calculate survival rate (0-1)."""
        if self.total_rounds == 0:
            return 0.5
        return self.rounds_survived / self.total_rounds
    
    @property
    def kd_ratio(self) -> float:
        """Calculate K/D ratio."""
        if self.total_deaths == 0:
            return self.total_kills
        return round(self.total_kills / self.total_deaths, 2)
    
    @property
    def opening_success_rate(self) -> float:
        """Calculate opening duel success rate."""
        if self.opening_duels_taken == 0:
            return 0.5
        return self.opening_duels_won / self.opening_duels_taken
    
    @property
    def primary_weapon(self) -> str:
        """Get most used weapon."""
        if not self.weapon_counts:
            return "Unknown"
        return max(self.weapon_counts.items(), key=lambda x: x[1])[0]
    
    def get_badges(self) -> List[str]:
        """Generate badges based on metrics."""
        badges = []
        
        # Aggression badges
        if self.aggression_score >= 0.7:
            badges.append("🦅 FIRST BLOOD")
            badges.append("⚔️ ENTRY")
        elif self.aggression_score >= 0.4:
            badges.append("💥 AGGRESSIVE")
        elif self.aggression_score <= 0.2:
            badges.append("🛡️ PASSIVE")
            
        # Survival badges
        if self.survival_rate >= 0.6:
            badges.append("🧱 ANCHOR")
        if self.survival_rate >= 0.7 and self.aggression_score <= 0.3:
            badges.append("🏰 SITE HOLDER")
            
        # Opening duel badges
        if self.opening_duels_taken >= 5 and self.opening_success_rate >= 0.6:
            badges.append("🎯 CLUTCH OPENER")
            
        # K/D badges
        if self.kd_ratio >= 1.3:
            badges.append("💀 HIGH IMPACT")
        
        return badges[:3]  # Max 3 badges
    
    def to_dict(self) -> Dict:
        """Convert to JSON-serializable dict."""
        primary_def_zone, def_freq = self.defense_zones.get_primary_zone()
        primary_atk_zone, atk_freq = self.attack_zones.get_primary_zone()
        
        return {
            "name": self.name,
            "agent": self.agent,
            "role": self.role,
            "tendencies": {
                "aggression_score": round(self.aggression_score, 2),
                "survival_rate": round(self.survival_rate, 2),
                "kd_ratio": self.kd_ratio,
                "opening_success": round(self.opening_success_rate, 2),
                "primary_weapon": self.primary_weapon,
                "badges": self.get_badges(),
            },
            "defensive_setup": {
                "preferred_site": primary_def_zone,
                "hold_frequency": f"{def_freq}%",
                "zone_distribution": self.defense_zones.get_percentages(),
            },
            "offensive_setup": {
                "preferred_zone": primary_atk_zone,
                "frequency": f"{atk_freq}%",
            },
            "stats": {
                "total_rounds": self.total_rounds,
                "kills": self.total_kills,
                "deaths": self.total_deaths,
                "opening_duels": self.opening_duels_taken,
                "opening_wins": self.opening_duels_won,
            }
        }


class SpatialEngine:
    """
    Spatial analysis engine for calculating player zones and tendencies.
    Uses coordinate bounding boxes to determine site-specific behavior.
    """
    
    def __init__(self):
        self.events: List[SpatialEvent] = []
        self.player_tendencies: Dict[str, PlayerTendencies] = {}
        self.rounds_data: Dict[int, List[SpatialEvent]] = defaultdict(list)
    
    def get_zone_for_coordinates(self, x: float, y: float, map_name: str) -> str:
        """
        Determine which zone a coordinate falls into.
        Returns the zone name or "Unknown" if not found.
        """
        map_name = self._normalize_map_name(map_name)
        
        if map_name not in MAP_ZONES:
            return "Unknown"
        
        zones = MAP_ZONES[map_name]
        
        for zone_name, (min_x, max_x, min_y, max_y) in zones.items():
            if min_x <= x <= max_x and min_y <= y <= max_y:
                return zone_name
        
        return "Unknown"
    
    def _normalize_map_name(self, map_name: str) -> str:
        """Normalize map name to match our dictionary keys."""
        if not map_name:
            return "Unknown"
        
        # Handle full path names like "/Game/Maps/Ascent/Ascent"
        if "/" in map_name:
            map_name = map_name.split("/")[-1]
        
        # Capitalize first letter
        return map_name.capitalize()
    
    def add_event(self, event: SpatialEvent):
        """Add a combat event for analysis."""
        self.events.append(event)
        self.rounds_data[event.round_number].append(event)
        
        # Update player tendencies
        if event.player_name not in self.player_tendencies:
            self.player_tendencies[event.player_name] = PlayerTendencies(
                name=event.player_name,
                agent=event.agent or "Unknown"
            )
        
        player = self.player_tendencies[event.player_name]
        
        # Update agent if known
        if event.agent:
            player.agent = event.agent
        
        # Get zone for this event
        zone = self.get_zone_for_coordinates(event.x, event.y, event.map_name)
        
        # Update zone distribution
        if event.team_side == "defense":
            player.defense_zones.add_event(zone)
        else:
            player.attack_zones.add_event(zone)
        
        # Update combat stats
        if event.event_type == "kill":
            player.total_kills += 1
        elif event.event_type == "death":
            player.total_deaths += 1
        
        # Track opening duels
        if event.is_opening:
            player.opening_duels_taken += 1
            if event.event_type == "kill":
                player.opening_duels_won += 1
        
        # Track weapon usage
        if event.weapon:
            player.weapon_counts[event.weapon] = player.weapon_counts.get(event.weapon, 0) + 1
    
    def process_round_events(self, round_events: List[Dict], round_number: int, map_name: str, team_id: str):
        """
        Process raw GRID API events for a single round.
        
        Args:
            round_events: List of event dictionaries from GRID API
            round_number: The round number
            map_name: Name of the map
            team_id: The target team's ID to track
        """
        first_blood_found = False
        
        for event in round_events:
            event_type = event.get("type", "").lower()
            
            # Only process kill/death events
            if event_type not in ["kill", "death", "playerKilled"]:
                continue
            
            # Extract player info
            player_data = event.get("player") or event.get("killer") or {}
            victim_data = event.get("victim") or event.get("killed") or {}
            
            # Get coordinates
            position = event.get("position") or event.get("location") or {}
            x = position.get("x", 0)
            y = position.get("y", 0)
            
            # Determine if this is from our target team
            player_team_id = player_data.get("teamId") or player_data.get("team_id")
            
            # Determine side (attack/defense)
            team_side = event.get("teamSide") or event.get("side") or "unknown"
            
            # Get weapon
            weapon = event.get("weapon") or event.get("weaponId") or "Unknown"
            if isinstance(weapon, dict):
                weapon = weapon.get("name", "Unknown")
            
            # Check if first blood
            is_opening = not first_blood_found
            if event_type in ["kill", "playerKilled"]:
                first_blood_found = True
            
            # Create spatial event
            spatial_event = SpatialEvent(
                player_name=player_data.get("name", "Unknown"),
                team_side=team_side,
                event_type="kill" if event_type in ["kill", "playerKilled"] else "death",
                x=x,
                y=y,
                round_number=round_number,
                map_name=map_name,
                agent=player_data.get("agent") or player_data.get("agentId"),
                weapon=weapon,
                is_opening=is_opening
            )
            
            self.add_event(spatial_event)
    
    def calculate_round_stats(self, players_alive_end: Dict[str, bool]):
        """Update round survival stats for players."""
        for player_name, survived in players_alive_end.items():
            if player_name in self.player_tendencies:
                self.player_tendencies[player_name].total_rounds += 1
                if survived:
                    self.player_tendencies[player_name].rounds_survived += 1
    
    def get_roster_intel(self) -> List[Dict]:
        """
        Get the full roster intel with tendencies for all tracked players.
        Returns list sorted by aggression score (most aggressive first).
        """
        roster = [player.to_dict() for player in self.player_tendencies.values()]
        
        # Sort by aggression score descending
        roster.sort(key=lambda x: x["tendencies"]["aggression_score"], reverse=True)
        
        return roster
    
    def get_player_summary(self, player_name: str) -> Optional[Dict]:
        """Get tendencies for a specific player."""
        if player_name not in self.player_tendencies:
            return None
        return self.player_tendencies[player_name].to_dict()
    
    def get_site_distribution_summary(self, side: str = "defense") -> Dict[str, Dict[str, float]]:
        """
        Get site distribution summary for all players.
        
        Args:
            side: "defense" or "attack"
            
        Returns:
            Dict mapping player names to their zone percentages
        """
        summary = {}
        
        for player_name, tendencies in self.player_tendencies.items():
            zones = tendencies.defense_zones if side == "defense" else tendencies.attack_zones
            summary[player_name] = zones.get_percentages()
        
        return summary


# ============ AGENT ROLE MAPPING ============
AGENT_ROLES = {
    # Duelists
    "Jett": "Duelist", "Raze": "Duelist", "Reyna": "Duelist", 
    "Phoenix": "Duelist", "Yoru": "Duelist", "Neon": "Duelist", "Iso": "Duelist",
    # Controllers
    "Brimstone": "Controller", "Omen": "Controller", "Astra": "Controller",
    "Viper": "Controller", "Harbor": "Controller", "Clove": "Controller",
    # Initiators
    "Sova": "Initiator", "Breach": "Initiator", "Skye": "Initiator",
    "KAY/O": "Initiator", "Fade": "Initiator", "Gekko": "Initiator",
    # Sentinels
    "Sage": "Sentinel", "Cypher": "Sentinel", "Killjoy": "Sentinel",
    "Chamber": "Sentinel", "Deadlock": "Sentinel", "Vyse": "Sentinel",
}


def get_agent_role(agent_name: str) -> str:
    """Get the role for an agent."""
    if not agent_name:
        return "Unknown"
    # Normalize agent name
    agent_name = agent_name.strip().title()
    return AGENT_ROLES.get(agent_name, "Unknown")
