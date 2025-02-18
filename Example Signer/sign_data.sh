#!/bin/bash

# Get paths from environment variables
CERTS_DIR=${CERTS_DIR:-"./certs"}
OUTPUT_DIR=${OUTPUT_DIR:-"./output"}

# Function to copy certificates to output directory
copy_certificates() {
    echo "Copying certificates to output directory..."
    
    # Copy certificate and bundle to output
    cp "${CERTS_DIR}/order_cert.crt" "${OUTPUT_DIR}/"
    cp "${CERTS_DIR}/order_cert_ca_bundle.crt" "${OUTPUT_DIR}/"
    cp "${CERTS_DIR}/order_report.json" "${OUTPUT_DIR}/"
    
    echo "Certificates and report are copied!"
}

# Function to fetch different types of data
fetch_data() {
    local data_type="$1"
    echo "Attempting to fetch data type: $data_type" >&2  # Print to stderr instead of stdout
    
    case "$data_type" in
        "weather")
            curl -s "https://wttr.in/London?format=j1"
            ;;
        "space")
            curl -s "http://api.open-notify.org/iss-now.json"
            ;;
        "crypto")
            curl -s "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd,eur"
            ;;
        "time")
            # Return only the JSON data
            echo "{
                \"timestamp\": \"$(date -u '+%Y-%m-%dT%H:%M:%SZ')\",
                \"timezones\": {
                    \"UTC\": \"$(date -u)\",
                    \"NY\": \"$(TZ='America/New_York' date)\",
                    \"London\": \"$(TZ='Europe/London' date)\"
                }
            }"
            ;;
        *)
            echo "Unknown data type: '$data_type'" >&2
            echo "Available types: time, crypto, weather, space" >&2
            return 1
            ;;
    esac
}

# Function for signing data
sign_data() {
    local input_data="$1"
    local data_type="$2"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local data_file="${OUTPUT_DIR}/${data_type}_${timestamp}.json"
    local signature_file="${OUTPUT_DIR}/${data_type}_${timestamp}.sig"

    # Save input data
    echo "$input_data" > "$data_file"

    # Create signature using private key
    openssl dgst -sha256 -sign "${CERTS_DIR}/order_cert.key" \
        -out "$signature_file" "$data_file"

    echo "Data saved to: $data_file"
    echo "Signature saved to: $signature_file"

    echo -e "\nFetched data (raw):"
    cat "$data_file"
    echo -e "\nParsed JSON:"
    cat "$data_file" | jq '.'
}

# Main execution
DATA_TYPE=${1:-"time"}  # Default to time if no argument provided

echo "Starting data fetching and signing process..."
echo "Data type: $DATA_TYPE"

# Copy certificates first
copy_certificates

fetched_data=$(fetch_data "$DATA_TYPE")
fetch_status=$?

if [ $fetch_status -eq 0 ] && [ ! -z "$fetched_data" ]; then
    sign_data "$fetched_data" "$DATA_TYPE"
else
    echo "Error: Failed to fetch data"
    exit 1
fi
