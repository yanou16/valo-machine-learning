"""Debug series state data extraction."""
import asyncio
import httpx
import os
import sys
sys.path.insert(0, 'backend')

from dotenv import load_dotenv
load_dotenv()

from clients.grid_client import GridClient

async def debug():
    client = GridClient()
    
    # 1. Search for Cloud9
    print("=== SEARCHING CLOUD9 ===")
    teams = await client.search_team("Cloud9")
    valorant_team = None
    for t in teams:
        if t.get("title", {}).get("name", "").lower() == "valorant":
            valorant_team = t
            print(f"Found: {t.get('name')} (ID: {t.get('id')}, Game: Valorant)")
            break
    
    if not valorant_team:
        valorant_team = teams[0]
        print(f"Using first: {valorant_team.get('name')}")
    
    # 2. Get series
    print("\n=== GETTING SERIES ===")
    series_list = await client.get_valorant_team_series(
        team_id=valorant_team["id"],
        limit=10
    )
    print(f"Found {len(series_list)} series")
    
    if series_list:
        # 3. Get series state for first series
        first_series = series_list[0]
        series_id = first_series.get("id")
        print(f"\n=== SERIES STATE FOR {series_id} ===")
        print(f"Series meta: {first_series.get('teams', [])}")
        
        state = await client.get_series_state(series_id)
        print(f"\nSeries State keys: {state.keys() if state else 'None'}")
        
        if state:
            print(f"\nFull state structure:")
            import json
            print(json.dumps(state, indent=2, default=str)[:2000])
            
            # Check games
            games = state.get("games", [])
            print(f"\n\n=== GAMES ({len(games)}) ===")
            for i, game in enumerate(games):
                print(f"\nGame {i+1}:")
                print(f"  - Map: {game.get('map', {}).get('name', 'Unknown')}")
                print(f"  - Teams: {[t.get('name') for t in game.get('teams', [])]}")
                print(f"  - Finished: {game.get('finished')}")
                
                # Check for scores
                for team_data in game.get("teams", []):
                    print(f"  - Team {team_data.get('name')}: score={team_data.get('score')}, won={team_data.get('won')}")

asyncio.run(debug())
