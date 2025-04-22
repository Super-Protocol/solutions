#!/bin/bash

usage() {
    echo "Usage: $0 --input <env> --tee <number> [--config <file>] [--solution <number>]"
    echo "Environment options (--input):"
    echo "  dev, stg, mainnet"
    echo "--tee: TEE offer number for n8n launch"
    echo "--config: Path to configuration file (default: ./config.json)"
    echo "--solution: N8N solution number (required for non-dev environments)"
    exit 1
}

# Set defaults
CONFIG="./config.json"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --input)
            INPUT="$2"
            shift 2
            ;;
        --config)
            CONFIG="$2"
            shift 2
            ;;
        --tee)
            TEE="$2"
            shift 2
            ;;
        --orders-limit)
            ORDERS_LIMIT="$2"
            shift 2
            ;;
        --solution)
            USER_SOLUTION="$2"
            shift 2
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo "Unknown parameter: $1"
            usage
            ;;
    esac
done

echo "Step 1: Validating parameters..."
if [[ -z "$INPUT" || -z "$TEE" ]]; then
    echo "Error: Both --input and --tee parameters are required"
    usage
fi

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
        BASE_IMAGE=6
        TUNNEL_LAUNCHER_SOLUTION=12
        STORAGE=39
        # Set default value for N8N_SOLUTION in dev environment if not provided
        if [[ -z "$USER_SOLUTION" ]]; then
            N8N_SOLUTION=198
        else
            N8N_SOLUTION=$USER_SOLUTION
        fi
        ;;
    "stg")
        BASE_IMAGE=4
        TUNNEL_LAUNCHER_SOLUTION=9
        STORAGE=38
        ;;
    "mainnet")
        BASE_IMAGE=13
        TUNNEL_LAUNCHER_SOLUTION=19
        STORAGE=47
        ;;
esac

# Override N8N_SOLUTION with user-provided value for non-dev environments
if [[ -n "$USER_SOLUTION" ]]; then
    N8N_SOLUTION=$USER_SOLUTION
fi

# Check if N8N_SOLUTION is set, exit with error if not and not in dev environment
if [[ -z "$N8N_SOLUTION" ]]; then
    echo "Error: --solution parameter is required for non-dev environments"
    exit 1
fi

echo "Using N8N_SOLUTION: $N8N_SOLUTION"

echo "Step 5: Creating tunnels launcher..."
SPCTL_CMD="$SPCTL workflows create --tee 1 --solution $BASE_IMAGE --solution $TUNNEL_LAUNCHER_SOLUTION --storage $STORAGE --config $CONFIG"
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

echo "Step 6: Creating n8n configuration..."
config_json="{\"tunnels\":{\"domain_settings\":{\"provision_type\":\"Temporary Domain (on *.superprotocol.io)\",\"tunnel_provisioner_order\":{\"order_id\":\"$launcher_order_id\",\"order_key\":\"$ENCRYPTION_KEY\"}}}}"
n8n_config="n8n-configuration-launcher-${launcher_order_id}.json"
echo "$config_json" > "$n8n_config"

echo "Step 7: Creating n8n workflow..."
N8N_CMD="$SPCTL workflows create --tee $TEE --solution $N8N_SOLUTION --solution-configuration $n8n_config --storage $STORAGE --config $CONFIG"
if [[ -n "$ORDERS_LIMIT" ]]; then
    N8N_CMD="$N8N_CMD --orders-limit $ORDERS_LIMIT"
fi
n8n_output=$($N8N_CMD)

n8n_order_id=$(echo "$n8n_output" | grep -o 'TEE order id: \["[0-9]*"\]' | grep -o '[0-9]*')
if [[ ! "$n8n_order_id" =~ ^[0-9]+$ ]]; then
    echo "Error: Failed to parse n8n order ID"
    exit 1
fi
echo "n8n order id: $n8n_order_id"

echo "Step 8: Checking tunnel launcher order result for domain..."
result_path=""
while true; do
    echo "Checking result for order $launcher_order_id..."
    
    # Store the complete output to a variable
    check_result=$($SPCTL orders download-result $launcher_order_id --config $CONFIG)
    echo "$check_result"
    
    # Check if result is ready and find the file
    if [[ $check_result == *"Order result was saved to"* ]]; then
        # Try to parse the path from the output
        potential_path=$(echo "$check_result" | grep -o "Order result was saved to .*" | sed 's/Order result was saved to //')
        if [[ -f "$potential_path" ]]; then
            result_path="$potential_path"
            echo "Result found at: $result_path"
            break
        else
            echo "Could not locate the result file. Please check manually."
            exit 1
        fi
    fi
    
    echo "Result not ready yet, waiting 30 seconds..."
    sleep 30
done

if [[ -n "$result_path" && -f "$result_path" ]]; then
    # Create a temporary directory to extract the archive
    temp_dir=$(mktemp -d)
    echo "Extracting archive to $temp_dir"
    
    # Extract the archive
    tar -xzf "$result_path" -C "$temp_dir"
    
    # Check if the result.json file exists
    if [[ -f "$temp_dir/output/result.json" ]]; then
        echo "Found result.json file"
        
        # Extract the domain from result.json
        domain=$(grep -o '"domain":"[^"]*' "$temp_dir/output/result.json" | cut -d '"' -f 4)
        
        if [[ -n "$domain" ]]; then
            echo ""
            echo "==================================================="
            echo "n8n instance is available at: https://$domain"
            echo "==================================================="
        else
            echo "Error: Could not extract domain from result.json"
        fi
    else
        echo "Error: result.json not found in the archive"
        echo "Listing contents of the extracted archive:"
        find "$temp_dir" -type f | sort
    fi
    
    # Clean up
    rm -rf "$temp_dir"
else
    echo "Error: Could not download order result or result file not found"
fi

echo "Script completed successfully."
