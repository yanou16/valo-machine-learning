"""
ML-based analysis for Valorant scouting reports.
Uses sklearn for clustering, scoring, and correlation analysis.
"""
from typing import Optional, List, Dict, Tuple
from dataclasses import dataclass, field
from collections import defaultdict

# Try to import numerical libraries
try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False
    np = None

try:
    from sklearn.cluster import KMeans
    from sklearn.preprocessing import StandardScaler
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


# Agent role mappings for Valorant
AGENT_ROLES = {
    # Duelists
    "Jett": "duelist", "Raze": "duelist", "Reyna": "duelist", 
    "Phoenix": "duelist", "Yoru": "duelist", "Neon": "duelist", "Iso": "duelist",
    # Controllers
    "Omen": "controller", "Brimstone": "controller", "Viper": "controller", 
    "Astra": "controller", "Harbor": "controller", "Clove": "controller",
    # Initiators
    "Sova": "initiator", "Breach": "initiator", "Skye": "initiator", 
    "KAY/O": "initiator", "Fade": "initiator", "Gekko": "initiator",
    # Sentinels
    "Sage": "sentinel", "Cypher": "sentinel", "Killjoy": "sentinel", 
    "Chamber": "sentinel", "Deadlock": "sentinel", "Vyse": "sentinel"
}

ROLE_ORDER = ["duelist", "controller", "initiator", "sentinel"]


@dataclass
class CompositionVector:
    """Represents a team composition as a feature vector."""
    agents: List[str]
    vector: List[float] = None  # Can be numpy array or list
    map_name: str = ""
    won: bool = False
    
    def __post_init__(self):
        if self.vector is None:
            self.vector = self._vectorize()
    
    def _vectorize(self):
        """Convert agent list to role count vector [duelists, controllers, initiators, sentinels]."""
        role_counts = {role: 0 for role in ROLE_ORDER}
        for agent in self.agents:
            role = AGENT_ROLES.get(agent, "unknown")
            if role in role_counts:
                role_counts[role] += 1
        
        vec = [role_counts[role] for role in ROLE_ORDER]
        if NUMPY_AVAILABLE and np is not None:
            return np.array(vec)
        return vec


class CompositionClusterer:
    """
    Clusters team compositions to identify playstyle archetypes.
    Uses K-Means on role-based feature vectors.
    """
    
    CLUSTER_LABELS = {
        (2, 1, 1, 1): "Aggressive Dual-Duelist",
        (3, 1, 1, 0): "Hyper-Aggressive Triple Duelist",
        (1, 2, 1, 1): "Control-Heavy",
        (1, 1, 2, 1): "Info-Focused",
        (1, 1, 1, 2): "Defense-Oriented",
        (2, 1, 2, 0): "Rush & Clear",
        (1, 2, 2, 0): "Slow Execute",
    }
    
    def __init__(self, n_clusters: int = 4):
        self.n_clusters = n_clusters
        self.compositions: List[CompositionVector] = []
        self.kmeans = None
        self.scaler = StandardScaler() if SKLEARN_AVAILABLE else None
        self.cluster_profiles: Dict[int, Dict] = {}
    
    def add_composition(self, agents: List[str], map_name: str = "", won: bool = False):
        """Add a team composition for analysis."""
        if len(agents) >= 3:  # At least 3 agents for meaningful analysis
            comp = CompositionVector(agents=agents, map_name=map_name, won=won)
            self.compositions.append(comp)
    
    def fit(self) -> bool:
        """Fit the clustering model. Returns True if successful."""
        if not SKLEARN_AVAILABLE or not NUMPY_AVAILABLE:
            return False
        
        if len(self.compositions) < self.n_clusters:
            # Not enough data for clustering
            return False
        
        # Build feature matrix
        X = np.array([c.vector for c in self.compositions])
        
        # Normalize
        X_scaled = self.scaler.fit_transform(X)
        
        # Cluster
        self.kmeans = KMeans(n_clusters=min(self.n_clusters, len(X)), random_state=42, n_init=10)
        self.kmeans.fit(X_scaled)
        
        # Generate cluster profiles
        self._generate_cluster_profiles()
        
        return True
    
    def _generate_cluster_profiles(self):
        """Analyze each cluster to create profiles."""
        if self.kmeans is None or not NUMPY_AVAILABLE:
            return
        
        labels = self.kmeans.labels_
        
        for cluster_id in range(self.kmeans.n_clusters):
            cluster_comps = [c for c, l in zip(self.compositions, labels) if l == cluster_id]
            
            if not cluster_comps:
                continue
            
            # Calculate average role distribution
            avg_vector = np.mean([c.vector for c in cluster_comps], axis=0)
            role_dist = {role: round(float(avg_vector[i]), 1) for i, role in enumerate(ROLE_ORDER)}
            
            # Calculate win rate
            wins = sum(1 for c in cluster_comps if c.won)
            win_rate = wins / len(cluster_comps) if cluster_comps else 0
            
            # Generate label based on dominant roles
            label = self._generate_label(avg_vector)
            
            self.cluster_profiles[cluster_id] = {
                "label": label,
                "role_distribution": role_dist,
                "win_rate": round(win_rate * 100, 1),
                "sample_count": len(cluster_comps),
                "maps_played": list(set(c.map_name for c in cluster_comps if c.map_name))
            }
    
    def _generate_label(self, avg_vector) -> str:
        """Generate a descriptive label for a cluster."""
        role_counts = dict(zip(ROLE_ORDER, [float(x) for x in avg_vector]))
        
        # Find dominant role(s)
        max_count = max(role_counts.values())
        dominant = [r for r, c in role_counts.items() if c >= max_count - 0.3]
        
        if len(dominant) == 1:
            role_name = dominant[0].capitalize()
            if role_counts[dominant[0]] >= 2:
                return f"Heavy {role_name}"
            return f"{role_name}-Focused"
        elif "duelist" in dominant and "initiator" in dominant:
            return "Aggressive Entry"
        elif "controller" in dominant and "sentinel" in dominant:
            return "Defensive Setup"
        else:
            return "Balanced Composition"
    
    def get_profiles(self) -> List[Dict]:
        """Get all cluster profiles."""
        return list(self.cluster_profiles.values())
    
    def predict_style(self, agents: List[str]) -> Optional[Dict]:
        """Predict the playstyle for a given composition."""
        if self.kmeans is None or not SKLEARN_AVAILABLE:
            return None
        
        comp = CompositionVector(agents=agents)
        X = self.scaler.transform([comp.vector])
        cluster_id = self.kmeans.predict(X)[0]
        
        return self.cluster_profiles.get(cluster_id)


class WeaknessScorer:
    """
    Scores exploitable weaknesses for a team.
    Higher score = more exploitable.
    """
    
    def __init__(self):
        self.map_stats: Dict[str, Dict] = {}  # map -> {wins, losses}
        self.agent_pool: Dict[str, int] = {}  # agent -> picks
        self.recent_results: List[bool] = []  # Last N results
        self.opponent_results: Dict[str, bool] = {}  # opponent -> won
        self.total_games: int = 0
    
    def add_map_result(self, map_name: str, won: bool):
        """Track map performance."""
        if map_name not in self.map_stats:
            self.map_stats[map_name] = {"wins": 0, "losses": 0}
        
        if won:
            self.map_stats[map_name]["wins"] += 1
        else:
            self.map_stats[map_name]["losses"] += 1
        
        self.total_games += 1
    
    def add_agents(self, agents: List[str]):
        """Track agent pool."""
        for agent in agents:
            self.agent_pool[agent] = self.agent_pool.get(agent, 0) + 1
    
    def add_result(self, won: bool, opponent: str = None):
        """Track match result."""
        self.recent_results.append(won)
        if opponent:
            self.opponent_results[opponent] = won
    
    def calculate_weaknesses(self) -> List[Dict]:
        """Calculate all weakness scores and return prioritized list."""
        weaknesses = []
        
        # Map vulnerabilities
        for map_name, stats in self.map_stats.items():
            total = stats["wins"] + stats["losses"]
            if total >= 2:
                win_rate = stats["wins"] / total
                if win_rate < 0.45:  # Below 45% = weakness
                    score = int((1 - win_rate) * 100)
                    weaknesses.append({
                        "type": "map_vulnerability",
                        "description": f"Weak on {map_name}",
                        "score": score,
                        "data": {
                            "map": map_name,
                            "win_rate": round(win_rate * 100, 1),
                            "games": total
                        },
                        "recommendation": f"Force {map_name} in map veto - they win only {round(win_rate*100)}%"
                    })
        
        # Agent pool depth
        unique_agents = len(self.agent_pool)
        if unique_agents < 8 and self.total_games >= 5:
            score = int((1 - unique_agents / 15) * 80)
            weaknesses.append({
                "type": "limited_agent_pool",
                "description": f"Limited agent pool ({unique_agents} agents)",
                "score": score,
                "data": {"unique_agents": unique_agents},
                "recommendation": "Ban their comfort picks to force uncomfortable compositions"
            })
        
        # Recent form momentum
        if len(self.recent_results) >= 3:
            recent_5 = self.recent_results[-5:]
            recent_win_rate = sum(recent_5) / len(recent_5)
            if recent_win_rate < 0.4:
                score = int((1 - recent_win_rate) * 70)
                weaknesses.append({
                    "type": "poor_recent_form",
                    "description": f"Poor recent form ({int(recent_win_rate*100)}% last {len(recent_5)})",
                    "score": score,
                    "data": {"recent_win_rate": round(recent_win_rate * 100, 1)},
                    "recommendation": "Apply early pressure - team may be low on confidence"
                })
        
        # Predictability (relies on same agents)
        if self.agent_pool and self.total_games >= 3:
            top_agents = sorted(self.agent_pool.values(), reverse=True)[:5]
            total_picks = sum(self.agent_pool.values())
            concentration = sum(top_agents) / total_picks if total_picks > 0 else 0
            
            if concentration > 0.8:  # Very predictable
                score = int(concentration * 60)
                weaknesses.append({
                    "type": "predictable_compositions",
                    "description": "Highly predictable agent selection",
                    "score": score,
                    "data": {"concentration": round(concentration * 100, 1)},
                    "recommendation": "Prepare specific counters for their standard composition"
                })
        
        # Sort by score (highest = most exploitable)
        weaknesses.sort(key=lambda x: -x["score"])
        
        return weaknesses
    
    def get_overall_exploitability(self) -> int:
        """Get overall exploitability score (0-100)."""
        weaknesses = self.calculate_weaknesses()
        if not weaknesses:
            return 25  # Default low score if no data
        
        # Weighted average of top 3 weaknesses
        top_scores = [w["score"] for w in weaknesses[:3]]
        weights = [0.5, 0.3, 0.2][:len(top_scores)]
        
        return int(sum(s * w for s, w in zip(top_scores, weights)) / sum(weights))


class LossCorrelator:
    """
    Analyzes patterns that correlate with losses.
    Identifies what factors appear more often in defeats.
    """
    
    def __init__(self):
        self.matches: List[Dict] = []  # List of match data
    
    def add_match(
        self, 
        won: bool, 
        map_name: str = None,
        agents: List[str] = None,
        went_overtime: bool = False,
        was_bo3_map3: bool = False,
        opponent_tier: str = "unknown"
    ):
        """Add a match for correlation analysis."""
        self.matches.append({
            "won": won,
            "map": map_name,
            "agents": agents or [],
            "overtime": went_overtime,
            "deciding_map": was_bo3_map3,
            "opponent_tier": opponent_tier,
            "role_counts": self._count_roles(agents or [])
        })
    
    def _count_roles(self, agents: List[str]) -> Dict[str, int]:
        """Count roles in a composition."""
        counts = {role: 0 for role in ROLE_ORDER}
        for agent in agents:
            role = AGENT_ROLES.get(agent)
            if role:
                counts[role] += 1
        return counts
    
    def analyze_correlations(self) -> List[Dict]:
        """Find patterns that correlate with losses."""
        if len(self.matches) < 3:
            return []
        
        correlations = []
        losses = [m for m in self.matches if not m["won"]]
        wins = [m for m in self.matches if m["won"]]
        
        total_losses = len(losses)
        total_matches = len(self.matches)
        
        if total_losses == 0:
            return []
        
        # Map correlations
        map_loss_rates = defaultdict(lambda: {"losses": 0, "total": 0})
        for m in self.matches:
            if m["map"]:
                map_loss_rates[m["map"]]["total"] += 1
                if not m["won"]:
                    map_loss_rates[m["map"]]["losses"] += 1
        
        for map_name, stats in map_loss_rates.items():
            if stats["total"] >= 2:
                loss_rate = stats["losses"] / stats["total"]
                overall_loss_rate = total_losses / total_matches
                
                # Check if this map has significantly higher loss rate
                if loss_rate > overall_loss_rate + 0.15 and loss_rate > 0.5:
                    correlations.append({
                        "factor": f"Playing on {map_name}",
                        "loss_correlation": round(loss_rate * 100, 1),
                        "insight": f"Loses {int(loss_rate*100)}% of games on {map_name}",
                        "sample_size": stats["total"],
                        "significance": "high" if stats["total"] >= 4 else "medium"
                    })
        
        # Role composition correlations
        for role in ROLE_ORDER:
            low_role_losses = sum(1 for m in losses if m["role_counts"].get(role, 0) < 1)
            high_role_losses = sum(1 for m in losses if m["role_counts"].get(role, 0) >= 2)
            
            low_role_total = sum(1 for m in self.matches if m["role_counts"].get(role, 0) < 1)
            high_role_total = sum(1 for m in self.matches if m["role_counts"].get(role, 0) >= 2)
            
            # Check if missing role correlates with losses
            if low_role_total >= 2:
                loss_rate = low_role_losses / low_role_total
                if loss_rate > 0.6:
                    correlations.append({
                        "factor": f"No {role} in composition",
                        "loss_correlation": round(loss_rate * 100, 1),
                        "insight": f"Loses {int(loss_rate*100)}% when playing without a {role}",
                        "sample_size": low_role_total,
                        "significance": "medium"
                    })
            
            # Check if too many of a role correlates with losses
            if high_role_total >= 2:
                loss_rate = high_role_losses / high_role_total
                if loss_rate > 0.7:
                    correlations.append({
                        "factor": f"2+ {role}s in composition",
                        "loss_correlation": round(loss_rate * 100, 1),
                        "insight": f"Loses {int(loss_rate*100)}% when running multiple {role}s",
                        "sample_size": high_role_total,
                        "significance": "medium"
                    })
        
        # Overtime correlation
        ot_matches = [m for m in self.matches if m["overtime"]]
        if len(ot_matches) >= 2:
            ot_loss_rate = sum(1 for m in ot_matches if not m["won"]) / len(ot_matches)
            if ot_loss_rate > 0.6:
                correlations.append({
                    "factor": "Games going to overtime",
                    "loss_correlation": round(ot_loss_rate * 100, 1),
                    "insight": f"Loses {int(ot_loss_rate*100)}% of overtime games (clutch pressure)",
                    "sample_size": len(ot_matches),
                    "significance": "high"
                })
        
        # Decider map correlation (BO3 map 3)
        decider_matches = [m for m in self.matches if m["deciding_map"]]
        if len(decider_matches) >= 2:
            decider_loss_rate = sum(1 for m in decider_matches if not m["won"]) / len(decider_matches)
            if decider_loss_rate > 0.6:
                correlations.append({
                    "factor": "Decider maps (BO3 map 3)",
                    "loss_correlation": round(decider_loss_rate * 100, 1),
                    "insight": f"Loses {int(decider_loss_rate*100)}% of deciding maps",
                    "sample_size": len(decider_matches),
                    "significance": "high"
                })
        
        # Sort by correlation strength
        correlations.sort(key=lambda x: -x["loss_correlation"])
        
        return correlations
    
    def get_summary(self) -> Dict:
        """Get a summary of loss patterns."""
        correlations = self.analyze_correlations()
        
        if not correlations:
            return {
                "patterns_found": 0,
                "top_weakness": None,
                "actionable_insight": "Not enough data to identify loss patterns"
            }
        
        top = correlations[0]
        
        return {
            "patterns_found": len(correlations),
            "top_weakness": top["factor"],
            "top_correlation": top["loss_correlation"],
            "actionable_insight": top["insight"],
            "all_patterns": correlations[:5]  # Top 5
        }


class MLAnalyzer:
    """
    Main class that orchestrates all ML-based analysis.
    Combines clustering, weakness scoring, and correlation analysis.
    """
    
    def __init__(self):
        self.clusterer = CompositionClusterer()
        self.weakness_scorer = WeaknessScorer()
        self.loss_correlator = LossCorrelator()
    
    def add_match_data(
        self,
        won: bool,
        map_name: str,
        agents: List[str],
        opponent: str = None,
        went_overtime: bool = False,
        was_decider: bool = False
    ):
        """Add match data for all analyzers."""
        # For clustering
        self.clusterer.add_composition(agents, map_name, won)
        
        # For weakness scoring
        self.weakness_scorer.add_map_result(map_name, won)
        self.weakness_scorer.add_agents(agents)
        self.weakness_scorer.add_result(won, opponent)
        
        # For loss correlation
        self.loss_correlator.add_match(
            won=won,
            map_name=map_name,
            agents=agents,
            went_overtime=went_overtime,
            was_bo3_map3=was_decider
        )
    
    def analyze(self) -> Dict:
        """Run all analyses and return combined results."""
        # Fit clustering model
        clustering_success = self.clusterer.fit()
        
        return {
            "composition_analysis": {
                "clustering_available": clustering_success,
                "playstyle_profiles": self.clusterer.get_profiles() if clustering_success else [],
                "note": "Need more matches for clustering" if not clustering_success else None
            },
            "weakness_analysis": {
                "exploitability_score": self.weakness_scorer.get_overall_exploitability(),
                "weaknesses": self.weakness_scorer.calculate_weaknesses()
            },
            "loss_correlation": self.loss_correlator.get_summary()
        }
    
    def get_top_insights(self, limit: int = 5) -> List[Dict]:
        """Get the most actionable insights across all analyses."""
        insights = []
        
        # From weaknesses
        for w in self.weakness_scorer.calculate_weaknesses()[:3]:
            insights.append({
                "priority": w["score"],
                "category": "weakness",
                "fact": w["description"],
                "recommendation": w["recommendation"]
            })
        
        # From correlations
        for c in self.loss_correlator.analyze_correlations()[:2]:
            insights.append({
                "priority": int(c["loss_correlation"]),
                "category": "pattern",
                "fact": c["insight"],
                "recommendation": f"Exploit: {c['factor']}"
            })
        
        # Sort by priority and return top N
        insights.sort(key=lambda x: -x["priority"])
        return insights[:limit]
