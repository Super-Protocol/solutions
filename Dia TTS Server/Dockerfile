FROM pytorch/pytorch:2.5.1-cuda12.4-cudnn9-runtime

ENV DEBIAN_FRONTEND=noninteractive
ENV PIP_PREFER_BINARY=1
ENV PIP_ROOT_USER_ACTION=ignore
ENV PYTHONUNBUFFERED=1
ENV CMAKE_BUILD_PARALLEL_LEVEL=8

RUN apt-get update && apt-get install -y --no-install-recommends \
  git \
  git-lfs \
  build-essential \
  libgl1-mesa-glx \
  libsndfile1 \
  ffmpeg \
  wget \
  curl \
  unzip \
  && apt-get clean && rm -rf /var/lib/apt/lists/*


ENV NODE_VERSION=20.18.0
ENV NVM_DIR=/usr/local/nvm
ENV NODE_OPTIONS="--enable-source-maps"
RUN mkdir -p $NVM_DIR
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
RUN . $NVM_DIR/nvm.sh \
  && nvm install $NODE_VERSION \
  && nvm alias default $NODE_VERSION \
  && nvm use default
ENV NODE_PATH=$NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH=$NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

RUN node -v && npm -v

# Переменные окружения для Super Protocol
ENV LOG_LEVEL=info
ENV INPUT_DATA_FOLDER=/sp/inputs

# Создаем рабочую директорию
WORKDIR /opt/app

# Копируем и собираем Node.js приложение
COPY src src
COPY .env.example .env
COPY config.json ./
COPY package.json package-lock.json tsconfig.json tsconfig.build.json ./
RUN --mount=type=cache,target=/root/.npm \
  npm ci && \
  npm run build && \
  npm ci --omit=dev

# Копируем Dia-TTS-Server
COPY dia-tts-server ./dia-tts-server

# Устанавливаем Python зависимости для Dia-TTS
WORKDIR /opt/app/dia-tts-server
RUN pip install --no-cache-dir \
  fastapi==0.104.1 \
  uvicorn==0.24.0 \
  pydantic==2.5.0 \
  PyYAML==6.0.1 \
  tqdm==4.66.1 \
  soundfile \
  librosa \
  dac \
  python-multipart \
  python-dotenv \  
  transformers \
  accelerate \
  && pip install --no-cache-dir torch torchaudio --index-url https://download.pytorch.org/whl/cu124

# Пытаемся установить дополнительные зависимости (если получится)
RUN pip install --no-cache-dir dac-pytorch || echo "dac-pytorch failed, continuing..." && \
  pip install --no-cache-dir parselmouth || echo "parselmouth failed, continuing..." && \
  pip install --no-cache-dir openai-whisper || echo "openai-whisper failed, continuing..."

# Возвращаемся в рабочую директорию
WORKDIR /opt/app

# Создаем необходимые директории
RUN mkdir -p /sp/inputs /sp/outputs /sp/secrets

# Запускаем приложение
ENTRYPOINT ["node", "dist/index.js"]
