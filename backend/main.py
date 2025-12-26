from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from routers.data_router import router as data_router
from routers.analysis_router import router as analysis_router
from routers.report_router import router as report_router

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="Automated scouting report generator for Valorant esports",
    version="0.1.0"
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(data_router)
app.include_router(analysis_router)
app.include_router(report_router)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "app": settings.app_name}


@app.get("/api/test-grid")
async def test_grid_connection():
    """Test GRID API connection."""
    from clients.grid_client import GridClient
    
    client = GridClient()
    try:
        result = await client.test_connection()
        return {"status": "connected", "data": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
