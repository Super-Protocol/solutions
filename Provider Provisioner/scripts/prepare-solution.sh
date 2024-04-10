#!/bin/bash
set -e

solution_path=$1
solution_name=$2

# cd to one directory up of current script
cd $(dirname $(realpath "$0"))/..

# download spctl-linux-x64 if not exists
if [[ ! -f ./tools/spctl ]]; then
  echo "$(pwd)/tools/spctl not found. Please download spctl binary from https://github.com/super-protocol/ctl/releases"
  ls -la ./tools
  exit 1
fi

echo "Install dependencies"
npm ci

echo "Compiling typescript"
npm run build

echo "Remove dev dependendencies"
npm ci --omit dev

echo "Copy files"
cp -R tools dist node_modules package.json package-lock.json .env $solution_path
