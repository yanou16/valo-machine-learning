"""Test the known working series ID directly."""
import asyncio
import sys
sys.path.insert(0, './backend')
from clients.grid_client import GridClient

async def test():
    client = GridClient()
    
    # Test the series we KNOW works (from earlier test)
    known_id = "2629392"
    
    print(f"Testing known working series {known_id}...")
    state = await client.get_series_state(known_id)
    
    if state and state.get("games"):
        games = state["games"]
        print(f"✅ SUCCESS! {len(games)} games")
        for g in games[:3]:
            map_name = g.get("map", {}).get("name", "?")
            teams = g.get("teams", [])
            scores = " vs ".join([f"{t['name']}:{t['score']}" for t in teams])
            print(f"   {map_name}: {scores}")
    else:
        print(f"❌ No data!")
        print(f"State: {state}")

asyncio.get_event_loop().run_until_complete(test())
