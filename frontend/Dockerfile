# =============================================================================
# ValoML Frontend Dockerfile
# Production-ready Next.js frontend for Hackathon demonstration
# =============================================================================

FROM node:20-alpine

WORKDIR /app

# Build-time argument for API URL (used during next build)
ARG NEXT_PUBLIC_API_URL=http://localhost:8000

# Set environment variable for build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy package files first (leverages Docker layer caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy application code
COPY . .

# Build the Next.js application
RUN npm run build

# Expose port for Next.js
EXPOSE 3000

# Start the production server
CMD ["npm", "start"]
