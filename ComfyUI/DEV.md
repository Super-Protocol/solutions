## Building developing image

```sh
docker buildx build -f Dockerfile.local-cpu -t comfyui .
```

## Building prod image

```
docker buildx build -f Dockerfile.prod --platform linux/amd64 --progress=plain -t comfyui-prod .
```

## Running the container

```sh
./start-dev-container.sh
```

## Stopping and saving changes from the container

```sh
save-and-stop-dev-container.sh
```

## Getting a snapshot of a workflow file:
1. `mkdir $(pwd)/workflows`
2. Copy `<your-workflow>.json` file into `workflows` dir
3. Execute in the terminal:
```sh
./snapshot-workflow.sh <your-workflow>
```