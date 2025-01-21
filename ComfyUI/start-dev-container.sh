#!/bin/bash

set -e

# Ensure local folders exists
mkdir -p models changeset snapshots

# Start the dev container with folder mounts
docker run -d \
  -it \
  --name comfyui \
  --publish 8188:8188 \
  --mount type=bind,source="$(pwd)"/models,target=/opt/ComfyUI/models \
  --mount type=bind,source="$(pwd)"/changeset,target=/opt/ComfyUI/changeset \
  --mount type=bind,source="$(pwd)"/snapshots,target=/opt/ComfyUI/user/default/ComfyUI-Manager/snapshots/ \
  comfyui

echo Waiting for ComfyUI to start...
until curl --output /dev/null --silent --head --fail http://localhost:8188; do
    printf '.'
    sleep 1
done
npx -y -q opener http://localhost:8188