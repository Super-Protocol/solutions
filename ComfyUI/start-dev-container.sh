#!/bin/bash

set -e

# Ensure local folders exists
mkdir -p models changeset snapshots

# Remove existing container if it exists
docker rm -f comfyui >/dev/null 2>&1 || true

# Start the dev container with folder mounts
docker run -d \
  -it \
  --name comfyui \
  --publish 8188:8188 \
  --mount type=bind,source="$(pwd)"/changeset,target=/opt/ComfyUI/changeset \
  --mount type=bind,source="$(pwd)"/workflows,target=/opt/ComfyUI/user/default/workflows \
  --mount type=bind,source="$(pwd)"/snapshots,target=/opt/ComfyUI/user/default/ComfyUI-Manager/snapshots/ \
  comfyui

echo Waiting for ComfyUI to start...
until curl --output /dev/null --silent --head --fail http://localhost:8188; do
    printf '.'
    sleep 1
done
echo "ComfyUI is running!"

if [ "$1" != "--no-browser" ]; then
  npx -y -q opener http://localhost:8188 || echo "Open http://localhost:8188 in your browser"
fi
