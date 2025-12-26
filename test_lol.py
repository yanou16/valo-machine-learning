"""Simple test - one game at a time."""
import asyncio
import sys
sys.path.insert(0, './backend')
from clients.grid_client import GridClient

client = GridClient()

async def test_one(game: str, team: str):
    """Test one game."""
    teams = await client.search_team(team)
    t = None
    for x in teams:
        if game.lower() in x.get("title", {}).get("name", "").lower():
            t = x
            break
    
    if not t:
        return f"{game}: ❌ No team"
    
    series = await client.get_team_series(t["id"], 5)
    if not series:
        return f"{game}: ❌ 0 series"
    
    # Count working series states
    working = 0
    for s in series[:3]:
        state = await client.get_series_state(s["id"])
        if state and state.get("games"):
            working += 1
    
    return f"{game}: {len(series)} series, {working}/3 have games"

async def main():
    print("Testing each game...\n")
    
    # Test one by one with delay
    result1 = await test_one("Dota", "Team Spirit")
    print(result1)
    await asyncio.sleep(10)
    
    result2 = await test_one("Counter-Strike", "Navi")
    print(result2)
    await asyncio.sleep(10)
    
    result3 = await test_one("League of Legends", "Fnatic")
    print(result3)
    await asyncio.sleep(10)
    
    result4 = await test_one("Valorant", "Sentinels")
    print(result4)

asyncio.get_event_loop().run_until_complete(main())
