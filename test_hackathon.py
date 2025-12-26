"""Full report display test."""
import asyncio
import httpx

async def test():
    async with httpx.AsyncClient(timeout=180) as client:
        print("=== FULL LLM SCOUTING REPORT TEST ===\n")
        
        resp = await client.post(
            "http://localhost:8001/api/report/generate",
            json={"team_name": "Sentinels", "num_matches": 5}
        )
        
        if resp.status_code == 200:
            data = resp.json()
            print(f"✅ Team: {data.get('team_name')}")
            print(f"✅ Matches: {data.get('matches_analyzed')}")
            
            print("\n" + "="*60)
            print("📋 SCOUTING REPORT:")
            print("="*60)
            print(data.get('report', 'No report'))
            print("="*60)
            
            print("\n🎉 SUCCESS! LLM Scouting Report Generated!")
        else:
            print(f"❌ Error: {resp.status_code}")
            print(resp.text)

asyncio.get_event_loop().run_until_complete(test())
