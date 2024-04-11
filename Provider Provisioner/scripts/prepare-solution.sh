#!/bin/bash
set -e

solution_path=$1
solution_name=$2

# cd to one directory up of current script
cd $(dirname $(realpath "$0"))/..

echo "Install dependencies"
npm ci

echo "Compiling typescript"
npm run build:all

# echo "Remove dev dependendencies"
# npm ci --omit dev

echo "Copy files"
cp -R tools dist node_modules package.json package-lock.json .env $solution_path
