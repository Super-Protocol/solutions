#!/bin/bash
set -e

solution_path=$1
solution_name=$2

# cd to one directory up of current script
cd $(dirname $(realpath "$0"))/..

npm ci
npm run build
cp -R .next dist node_modules public next.config.js package.json .env $solution_path
