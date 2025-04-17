#!/bin/bash

usage() {
    echo "Usage: $0 --order-id <launcher_order_id> [--config <file>]"
    echo "--order-id: The tunnel launcher order ID to check for results"
    echo "--config: Path to configuration file (default: ./config.json)"
    exit 1
}

# Set defaults
CONFIG="./config.json"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --order-id)
            launcher_order_id="$2"
            shift 2
            ;;
        --config)
            CONFIG="$2"
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

if [[ -z "$launcher_order_id" ]]; then
    echo "Error: --order-id parameter is required"
    usage
fi

if [[ ! -f "$CONFIG" ]]; then
    echo "Error: Config file does not exist: $CONFIG"
    exit 1
fi

echo "Looking for SPCTL binary..."
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

echo "Checking tunnel launcher order result for order ID: $launcher_order_id"
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
