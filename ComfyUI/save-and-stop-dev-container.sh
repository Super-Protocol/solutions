#!/bin/bash

echo "Saving changeset of $1..."

# run the script
docker exec comfyui sh -c "/opt/ComfyUI/save-changeset.sh $1"

# stop the container
docker stop comfyui

# show the folder with changeset
npx -y -q opener ./changeset || echo "Open ./changeset in your file explorer"