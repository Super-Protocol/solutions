## Building developing image

```sh
docker buildx build -f Dockerfile.local-cpu -t comfyui .
```

## Running the container

```sh
./start-dev-container.sh
```

## Stopping and saving changes from the container

```sh
save-and-stop-dev-container.sh
```

