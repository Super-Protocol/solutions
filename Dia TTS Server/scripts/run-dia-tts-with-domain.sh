#!/bin/bash

# Super Protocol Dia-TTS-Server launcher script
# Based on n8n launcher

set -e

# Default values
CONFIG="./config.json"
ORDERS_LIMIT=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --input)
            INPUT="$2"
            shift 2
            ;;
        --tee)
            TEE="$2"
            shift 2
            ;;
        --config)
            CONFIG="$2"
            shift 2
            ;;
        --solution)
            USER_SOLUTION="$2"
            shift 2
            ;;
        --orders-limit)
            ORDERS_LIMIT="$2"
            shift 2
            ;;
        *)
            echo "Unknown option $1"
            exit 1
            ;;
    esac
done

# Validate required parameters
if [[ -z "$INPUT" || -z "$TEE" ]]; then
    echo "Usage: $0 --input <env> --tee <tee_number> [--config <file>] [--solution <number>] [--orders-limit <number>]"
    exit 1
fi

echo "Step 1: Validating parameters..."
if [[ ! "$INPUT" =~ ^(dev|stg|mainnet)$ ]]; then
    echo "Error: Invalid input value. Must be dev, stg, or mainnet"
    exit 1
fi

if [[ ! -f "$CONFIG" ]]; then
    echo "Error: Config file does not exist: $CONFIG"
    exit 1
fi

echo "Step 2: Parsing encryption key from config..."
ENCRYPTION_KEY=$(awk -F'"' '/"workflow"/{f=1} f&&/"resultEncryption"/{f=2} f==2&&/"key"/{print $4;exit}' "$CONFIG")
if [[ -z "$ENCRYPTION_KEY" ]]; then
    echo "Error: Could not parse encryption key from config"
    exit 1
fi

echo "Step 3: Looking for SPCTL binary..."
for binary in "spctl" "spctl-linux-x64" "spctl-macos-arm64" "spctl-macos-x64"; do
    if [[ -f "./$binary" ]]; then
        SPCTL="./$binary"
        break
    fi
done

if [[ -z "$SPCTL" ]]; then
    echo "Error: No SPCTL binary found"
    exit 1
fi

echo "Step 4: Setting environment variables..."
case $INPUT in
    "dev")
        TUNNEL_LAUNCHER_SOLUTION=12
        STORAGE=39
        if [[ -z "$USER_SOLUTION" ]]; then
            DIA_SOLUTION=999  # Пока заглушка, потом поменяем
        else
            DIA_SOLUTION=$USER_SOLUTION
        fi
        ;;
    "stg")
        TUNNEL_LAUNCHER_SOLUTION=9
        STORAGE=38
        ;;
    "mainnet")
        TUNNEL_LAUNCHER_SOLUTION=19
        STORAGE=47
        ;;
esac

# Override with user-provided value
if [[ -n "$USER_SOLUTION" ]]; then
    DIA_SOLUTION=$USER_SOLUTION
fi

echo "Using DIA_SOLUTION: $DIA_SOLUTION"

echo "Step 5: Creating tunnels launcher..."
SPCTL_CMD="$SPCTL workflows create --tee 7 --solution $TUNNEL_LAUNCHER_SOLUTION --storage $STORAGE --config $CONFIG"
if [[ -n "$ORDERS_LIMIT" ]]; then
    SPCTL_CMD="$SPCTL_CMD --orders-limit $ORDERS_LIMIT"
fi
output=$($SPCTL_CMD)

launcher_order_id=$(echo "$output" | grep -o 'TEE order id: \["[0-9]*"\]' | grep -o '[0-9]*')
if [[ ! "$launcher_order_id" =~ ^[0-9]+$ ]]; then
    echo "Error: Failed to parse launcher order ID"
    exit 1
fi
echo "Tunnels Launcher order id: $launcher_order_id"

echo "Step 6: Creating Dia-TTS configuration..."
config_json="{\"tunnels\":{\"domain_settings\":{\"provision_type\":\"Temporary Domain (on *.superprotocol.io)\",\"tunnel_provisioner_order\":{\"order_id\":\"$launcher_order_id\",\"order_key\":\"$ENCRYPTION_KEY\"}}}}"
dia_config="dia-tts-configuration-launcher-${launcher_order_id}.json"
echo "$config_json" > "$dia_config"

echo "Step 7: Creating Dia-TTS workflow..."
DIA_CMD="$SPCTL workflows create --tee $TEE --solution $DIA_SOLUTION --solution-configuration $dia_config --storage $STORAGE --config $CONFIG"
if [[ -n "$ORDERS_LIMIT" ]]; then
    DIA_CMD="$DIA_CMD --orders-limit $ORDERS_LIMIT"
fi
dia_output=$($DIA_CMD)

dia_order_id=$(echo "$dia_output" | grep -o 'TEE order id: \["[0-9]*"\]' | grep -o '[0-9]*')
if [[ ! "$dia_order_id" =~ ^[0-9]+$ ]]; then
    echo "Error: Failed to parse Dia-TTS order ID"
    exit 1
fi
echo "Dia-TTS order id: $dia_order_id"

echo "Dia-TTS Server is being deployed. Check the tunnel launcher order result for the domain."
echo "You can use: $SPCTL orders download-result $launcher_order_id --config $CONFIG"
