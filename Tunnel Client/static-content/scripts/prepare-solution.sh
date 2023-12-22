#!/bin/bash
set -e

solution_path=$1
solution_name=$2

cd $(dirname $(realpath "$0"))/..

echo "Install dependencies"
npm ci

echo "Build"
npm run build

echo "Copy files"

cp -R build/* $solution_path
