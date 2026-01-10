# =============================================================================
# ValoML Backend Dockerfile
# Production-ready FastAPI backend for Hackathon demonstration
# =============================================================================

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies required for some Python packages
# gcc: needed for compiling some pip packages
# libpq-dev: needed for psycopg2 if using PostgreSQL
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (leverages Docker layer caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create models directory for persisted ML models
RUN mkdir -p /app/models

# Expose port for FastAPI
EXPOSE 8000

# Run the application with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
