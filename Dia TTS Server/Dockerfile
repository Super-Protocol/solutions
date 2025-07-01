# Стадия сборки Node.js
FROM node:20-bookworm AS builder
WORKDIR /app
COPY package*.json tsconfig*.json ./
RUN npm ci
COPY src ./src
COPY .env.example .env
RUN npm run build && npm ci --omit=dev

# Финальный образ с PyTorch и Node.js
FROM pytorch/pytorch:2.5.1-cuda12.4-cudnn9-runtime

ENV DEBIAN_FRONTEND=noninteractive \
    PIP_PREFER_BINARY=1 \
    PIP_ROOT_USER_ACTION=ignore \
    PYTHONUNBUFFERED=1 \
    LOG_LEVEL=info \
    INPUT_DATA_FOLDER=/sp/inputs

# Устанавливаем Node.js 20 из официального репозитория
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs git git-lfs build-essential libgl1-mesa-glx libsndfile1 ffmpeg \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/app

# Копируем собранное Node.js приложение из builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.env ./.env

# Копируем и устанавливаем Python зависимости
COPY dia-tts-server ./dia-tts-server
RUN pip install --no-cache-dir torch torchaudio --index-url https://download.pytorch.org/whl/cu124 \
    && pip install --no-cache-dir -r dia-tts-server/requirements.txt

# Создаем необходимые директории
RUN mkdir -p /sp/inputs /sp/outputs /sp/secrets

ENTRYPOINT ["node", "dist/index.js"]

