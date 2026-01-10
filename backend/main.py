"""
ValoML FastAPI Backend
======================
Main application entry point with Prometheus metrics instrumentation.

Metrics Exposed:
- valoml_requests_total: Total HTTP requests by endpoint and method
- valoml_prediction_count: Total ML inference/prediction requests
- valoml_inference_latency_seconds: Histogram of ML inference latency
"""
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.routing import Mount

from config import get_settings
from routers.data_router import router as data_router
from routers.analysis_router import router as analysis_router
from routers.report_router import router as report_router
from routers.chat_router import router as chat_router

# =============================================================================
# Prometheus Metrics Setup
# =============================================================================
from prometheus_client import (
    Counter,
    Histogram,
    make_asgi_app,
    CONTENT_TYPE_LATEST,
)

# Custom Metrics for ValoML
# -------------------------
# Counter: Tracks total prediction/inference requests
# Why? To monitor API usage and detect traffic spikes or anomalies.
VALOML_PREDICTION_COUNT = Counter(
    'valoml_prediction_count',
    'Total number of ML prediction/inference requests',
    ['endpoint', 'status']
)

# Histogram: Tracks latency distribution for ML inference
# Why? To identify slow predictions and optimize model performance.
# Buckets optimized for ML workloads (10ms to 10s range)
VALOML_INFERENCE_LATENCY = Histogram(
    'valoml_inference_latency_seconds',
    'Time spent processing ML inference requests',
    ['endpoint'],
    buckets=[0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0]
)

# General request counter for all endpoints
VALOML_REQUESTS_TOTAL = Counter(
    'valoml_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status_code']
)

# =============================================================================
# FastAPI Application Setup
# =============================================================================
settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="Automated scouting report generator for Valorant esports",
    version="0.1.0"
)

# Mount Prometheus metrics endpoint
# This exposes /metrics for Prometheus to scrape
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# Middleware: Request Metrics Collection
# =============================================================================
@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    """
    Middleware to track all HTTP requests.
    Records: method, endpoint path, and response status code.
    """
    # Skip metrics endpoint to avoid infinite loops
    if request.url.path == "/metrics":
        return await call_next(request)
    
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    # Record request metrics
    VALOML_REQUESTS_TOTAL.labels(
        method=request.method,
        endpoint=request.url.path,
        status_code=response.status_code
    ).inc()
    
    # Track latency for analysis endpoints (ML inference)
    if "/analysis" in request.url.path or "/report" in request.url.path:
        VALOML_INFERENCE_LATENCY.labels(endpoint=request.url.path).observe(duration)
        VALOML_PREDICTION_COUNT.labels(
            endpoint=request.url.path,
            status="success" if response.status_code < 400 else "error"
        ).inc()
    
    return response


# =============================================================================
# Include Routers
# =============================================================================
app.include_router(data_router)
app.include_router(analysis_router)
app.include_router(report_router)
app.include_router(chat_router)


# =============================================================================
# Health Check Endpoint
# =============================================================================
@app.get("/health")
async def health_check():
    """Health check endpoint for container orchestration."""
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
