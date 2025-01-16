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

## Getting changes from the container

```sh
git stash --all --include-untracked
git checkout -b my-setup-changes
git stash apply
git add --all
git commit -m 'Getting all my changes'
git archive -o update.zip HEAD $(git diff --submodule=diff --name-only HEAD HEAD^)
```

