#!/bin/bash

# create a ComfyUI Manager snapshot
curl -H 'Comfy-User;' http://localhost:8188/api/snapshot/save

# run the script
docker exec comfyui /opt/ComfyUI/save-changeset.sh

# stop the container
docker stop comfyui

# show the folder with changeset
npx -y -q opener ./changeset