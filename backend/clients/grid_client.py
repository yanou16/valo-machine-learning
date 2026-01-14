import httpx
from typing import Optional, Any
from config import get_settings


class GridClient:
    """GraphQL client for GRID Central Data and Stats Feed APIs."""
    
    def __init__(self):
        self.settings = get_settings()
        self.headers = {
            "x-api-key": self.settings.grid_api_key,
            "Content-Type": "application/json"
        }
    
    async def _execute_query(self, url: str, query: str, variables: Optional[dict] = None) -> dict:
        """Execute a GraphQL query."""
        payload = {"query": query}
        if variables:
            payload["variables"] = variables
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json=payload,
                headers=self.headers,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    
    async def test_connection(self) -> dict:
        """Test API connection with a simple query."""
        query = """
        query TestConnection {
            titles {
                id
                name
                nameShortened
            }
        }
        """
        return await self._execute_query(self.settings.grid_central_data_url, query)
    
    async def get_all_titles(self) -> list[dict]:
        """Get all available game titles."""
        query = """
        query GetTitles {
            titles {
                id
                name
                nameShortened
                logoUrl
            }
        }
        """
        result = await self._execute_query(self.settings.grid_central_data_url, query)
        return result.get("data", {}).get("titles", [])
    
    async def get_valorant_title_id(self) -> Optional[str]:
        """Get the Valorant title ID from GRID."""
        titles = await self.get_all_titles()
        for title in titles:
            if title.get("name", "").lower() == "valorant":
                return title.get("id")
        return None
    
    async def search_team(self, team_name: str, limit: int = 10) -> list[dict]:
        """Search for teams by name."""
        query = """
        query SearchTeams($searchTerm: String!, $first: Int!) {
            teams(filter: { name: { contains: $searchTerm } }, first: $first) {
                totalCount
                edges {
                    node {
                        id
                        name
                        nameShortened
                        logoUrl
                        title {
                            id
                            name
                        }
                    }
                }
            }
        }
        """
        result = await self._execute_query(
            self.settings.grid_central_data_url,
            query,
            {"searchTerm": team_name, "first": limit}
        )
        
        teams = []
        data = result.get("data") or {}
        teams_data = data.get("teams") or {}
        edges = teams_data.get("edges") or []
        for edge in edges:
            if edge and "node" in edge:
                teams.append(edge["node"])
        return teams
    
    async def get_team_series(
        self, 
        team_id: str, 
        limit: int = 20
    ) -> list[dict]:
        """Get recent series (matches) for a team, filtering to past matches only."""
        from datetime import datetime
        now = datetime.utcnow()
        
        query = """
        query GetTeamMatches($teamId: ID!, $first: Int!) {
            allSeries(
                filter: { teamIds: { in: [$teamId] } }
                orderBy: StartTimeScheduled
                orderDirection: DESC
                first: $first
            ) {
                totalCount
                edges {
                    node {
                        id
                        startTimeScheduled
                        format {
                            name
                        }
                        teams {
                            baseInfo {
                                id
                                name
                                logoUrl
                            }
                            scoreAdvantage
                        }
                        tournament {
                            name
                        }
                        title {
                            name
                        }
                    }
                }
            }
        }
        """
        # Cap API request to avoid errors with large limits
        fetch_limit = min(limit * 2, 50)
        
        result = await self._execute_query(
            self.settings.grid_central_data_url,
            query,
            {"teamId": team_id, "first": fetch_limit}
        )
        
        # Filter to only past series (before now)
        series = []
        data = result.get("data") or {}
        all_series = data.get("allSeries") or {}
        edges = all_series.get("edges") or []
        for edge in edges:
            if not edge or "node" not in edge:
                continue
            node = edge["node"]
            if not node:
                continue
            scheduled = node.get("startTimeScheduled", "")
            if scheduled:
                try:
                    match_time = datetime.fromisoformat(scheduled.replace("Z", "+00:00"))
                    if match_time.replace(tzinfo=None) <= now:
                        series.append(node)
                except:
                    pass  # Skip if date parsing fails
            if len(series) >= limit:
                break
        
        return series
    
    async def get_valorant_team_series(
        self,
        team_id: str,
        limit: int = 20
    ) -> list[dict]:
        """Get recent Valorant series for a team."""
        all_series = await self.get_team_series(team_id, limit * 2)
        
        # Filter for Valorant only
        valorant_series = [
            s for s in all_series 
            if s.get("title", {}).get("name", "").lower() == "valorant"
        ]
        
        return valorant_series[:limit]
    
    async def get_series_details(self, series_id: str) -> dict:
        """Get detailed information about a series."""
        query = """
        query GetSeriesDetails($seriesId: ID!) {
            series(id: $seriesId) {
                id
                startTimeScheduled
                format {
                    name
                }
                teams {
                    baseInfo {
                        id
                        name
                        logoUrl
                    }
                    scoreAdvantage
                }
                games {
                    id
                    sequenceNumber
                    map {
                        name
                    }
                    teams {
                        baseInfo {
                            id
                            name
                        }
                        score
                        side
                        won
                    }
                    finished
                }
                tournament {
                    name
                }
                title {
                    name
                }
            }
        }
        """
        result = await self._execute_query(
            self.settings.grid_central_data_url,
            query,
            {"seriesId": series_id}
        )
        return result.get("data", {}).get("series", {})
    
    async def get_team_stats(self, team_id: str) -> dict:
        """Get aggregated statistics for a team from Stats Feed."""
        query = """
        query GetTeamStats($teamId: ID!) {
            team(id: $teamId) {
                id
                name
                recentMatches {
                    totalCount
                }
            }
        }
        """
        result = await self._execute_query(
            self.settings.grid_stats_feed_url,
            query,
            {"teamId": team_id}
        )
        return result.get("data", {}).get("team", {})
    
    async def get_series_state(self, series_id: str) -> dict:
        """
        Get detailed series state from Live Data Feed.
        Includes games, maps, teams, and scores.
        """
        # Use simplified query that works reliably
        query = """
        query GetSeriesState($seriesId: ID!) {
            seriesState(id: $seriesId) {
                id
                finished
                teams {
                    name
                    score
                    won
                }
                games {
                    id
                    sequenceNumber
                    finished
                    map {
                        name
                    }
                    teams {
                        name
                        score
                        won
                        side
                    }
                }
            }
        }
        """
        result = await self._execute_query(
            self.settings.grid_live_data_url,
            query,
            {"seriesId": series_id}
        )
        return result.get("data", {}).get("seriesState", {})
