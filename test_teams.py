"""Debug team search."""
import asyncio
import httpx

async def test():
    async with httpx.AsyncClient(timeout=30) as client:
        # Test team search
        print("=== TESTING TEAM SEARCH ===\n")
        
        teams_to_test = ["Sentinels", "LOUD", "Cloud9", "FNATIC"]
        
        for team in teams_to_test:
            print(f"\n--- Searching: {team} ---")
            try:
                r = await client.get(f"http://localhost:8001/api/data/teams/search?q={team}")
                data = r.json()
                print(f"Found {data.get('count', 0)} teams:")
                for t in data.get('teams', [])[:3]:
                    print(f"  - {t.get('name')} (ID: {t.get('id')}, Game: {t.get('title', {}).get('name', 'N/A')})")
            except Exception as e:
                print(f"Error: {e}")
        
        # Test full report for a known team
        print("\n\n=== TESTING REPORT GENERATION ===")
        print("Testing with 'Cloud9'...")
        try:
            r = await client.post(
                "http://localhost:8001/api/report/generate",
                json={"team_name": "Cloud9", "num_matches": 3},
                timeout=120
            )
            if r.status_code == 200:
                data = r.json()
                print(f"✅ Success! Team: {data.get('team_name')}, Matches: {data.get('matches_analyzed')}")
            else:
                print(f"❌ Error {r.status_code}: {r.text[:200]}")
        except Exception as e:
            print(f"Error: {e}")

asyncio.run(test())
