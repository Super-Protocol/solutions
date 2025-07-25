# Node.js build stage for wrapper
FROM node:20-bookworm AS builder
WORKDIR /app
COPY package*.json tsconfig*.json ./
RUN npm ci
COPY src ./src
COPY .env.example .env
RUN npm run build && npm ci --omit=dev

# Build Open WebUI frontend
FROM node:20-bookworm AS frontend-builder
WORKDIR /frontend
COPY open-webui/package*.json ./
RUN npm ci
COPY open-webui/ ./
RUN npm run build

# Final image with Python and Node.js
FROM python:3.11-slim-bookworm

ENV DEBIAN_FRONTEND=noninteractive \
    PIP_PREFER_BINARY=1 \
    PIP_ROOT_USER_ACTION=ignore \
    PYTHONUNBUFFERED=1 \
    LOG_LEVEL=info \
    INPUT_DATA_FOLDER=/sp/inputs

# Install Node.js 20 and system dependencies
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs git build-essential \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/app

# Copy built Node.js application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.env ./.env

# Copy Open WebUI backend and required root files
COPY open-webui/backend ./open-webui/backend
RUN pip install --no-cache-dir -r open-webui/backend/requirements.txt

# Copy built frontend from frontend-builder stage
COPY --from=frontend-builder /frontend/build ./open-webui/build

# Create CHANGELOG.md file that Open WebUI expects
RUN echo "# Open WebUI - Super Protocol Integration" > /opt/app/open-webui/CHANGELOG.md
# Set Python path to include Open WebUI backend
ENV PYTHONPATH="/opt/app/open-webui/backend:$PYTHONPATH"

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

# Create necessary directories
RUN mkdir -p /sp/inputs /sp/outputs /sp/secrets /opt/app/data

# Environment variables for Open WebUI
ENV WEBUI_AUTH=False \
    ENABLE_LOGIN_FORM=false \
    ENABLE_SIGNUP=false \
    USE_OLLAMA_DOCKER=true \
    OLLAMA_BASE_URL=http://localhost:11434 \
    DATA_DIR=/opt/app/data

ENTRYPOINT ["node", "dist/index.js"]
