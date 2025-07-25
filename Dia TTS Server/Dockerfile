# Node.js build stage
FROM node:20-bookworm AS builder
WORKDIR /app
COPY package*.json tsconfig*.json ./
RUN npm ci
COPY src ./src
COPY .env.example .env
RUN npm run build && npm ci --omit=dev

# Final image with PyTorch and Node.js
FROM pytorch/pytorch:2.5.1-cuda12.4-cudnn9-runtime

ENV DEBIAN_FRONTEND=noninteractive \
    PIP_PREFER_BINARY=1 \
    PIP_ROOT_USER_ACTION=ignore \
    PYTHONUNBUFFERED=1 \
    LOG_LEVEL=info \
    INPUT_DATA_FOLDER=/sp/inputs

# Install Node.js 20 from official repository
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs git git-lfs build-essential libgl1-mesa-glx libsndfile1 ffmpeg \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/app

# Copy built Node.js application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.env ./.env

# Copy and install Python dependencies
COPY dia-tts-server ./dia-tts-server
RUN pip install --no-cache-dir torch torchaudio --index-url https://download.pytorch.org/whl/cu124 \
    && pip install --no-cache-dir -r dia-tts-server/requirements.txt

# Create necessary directories
RUN mkdir -p /sp/inputs /sp/outputs /sp/secrets

ENTRYPOINT ["node", "dist/index.js"]

