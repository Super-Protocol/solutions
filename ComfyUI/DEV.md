## Building developing image

```sh
docker buildx build -f Dockerfile.local-cpu -t comfyui .
```

## Running the container

```sh
docker run \
    --name comfyui \
    --publish 8188:8188 \
    # optionally to run in background
    --detach \ 
    --restart unless-stopped \
    comfyui
```

