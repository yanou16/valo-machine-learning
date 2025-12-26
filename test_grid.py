"""Test full output of Series State API."""
import asyncio
import httpx
import json
import sys
sys.path.insert(0, './backend')
from config import get_settings

settings = get_settings()

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
            map { name }
            teams {
                name
                score
                won
            }
        }
    }
}
"""

async def test():
    async with httpx.AsyncClient() as client:
        # Get a series ID first
        search_resp = await client.post(
            settings.grid_central_data_url,
            json={
                'query': '''
                query { 
                    allSeries(
                        filter: { teamIds: { in: ["1079"] } }
                        first: 1
                    ) { 
                        edges { node { id } } 
                    } 
                }
                ''',
                'variables': {}
            },
            headers={'x-api-key': settings.grid_api_key}
        )
        series_id = search_resp.json()['data']['allSeries']['edges'][0]['node']['id']
        print(f"Series ID: {series_id}")
        
        # Test series state
        resp = await client.post(
            settings.grid_live_data_url,
            json={'query': query, 'variables': {'seriesId': series_id}},
            headers={'x-api-key': settings.grid_api_key}
        )
        data = resp.json()
        print(json.dumps(data, indent=2))

asyncio.get_event_loop().run_until_complete(test())
