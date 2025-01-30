set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <path-to-workflows-file-without-json-extension>"
  exit 1
elif [ ! -f "$(pwd)/workflows/$1.json" ]; then
  echo "🛑  File $(pwd)/workflows/$1.json not found"
  exit 2
fi

# Start the dev container with folder mounts
./start-dev-container.sh --no-browser

# Save the snapshot
./save-and-stop-dev-container.sh $1
