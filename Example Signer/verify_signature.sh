#!/bin/bash

# Environment variables with defaults
CERTS_DIR=${CERTS_DIR:-"./certs"}
OUTPUT_DIR=${OUTPUT_DIR:-"./output"}

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Function to print section headers
print_header() {
   local header="$1"
   echo -e "\n${BOLD}=== ${BLUE}${header}${NC} ${BOLD}===${NC}"
}

# Function to print colored status
print_status() {
   local status="$1"
   local color="$2"
   echo -e "${color}${status}${NC}"
}

# Function to print field with label
print_field() {
   local label="$1"
   local value="$2"
   local indent="$3"
   local color="$4"
   echo -e "${indent}${BOLD}${label}:${NC} ${color}${value}${NC}"
}

# Function to display certificate extensions
show_certificate_extensions() {
    local cert_file="$1"
    local indent="$2"
    
    echo "${indent}Extensions:"
    
    # Use openssl with -certopt ext_dump to show extensions in HEX
    openssl x509 -in "$cert_file" -text -noout -certopt ext_dump | awk -v indent="$indent" '
        BEGIN { 
            printing = 0;
            # Map OIDs to readable names
            oid_names["1.3.6.1.3.8888.1.1"] = "Challenge Type";
            oid_names["1.3.6.1.3.8888.1.2"] = "Challenge VM Hash";
            oid_names["1.3.6.1.3.8888.1.3"] = "Challenge Signature Key Hash";
            oid_names["1.3.6.1.3.8888.2.3"] = "Report Info Hash";
            oid_names["0.6.9.42.840.113741.1337.6"] = "Remote Attestation Report";
        }
        /X509v3 extensions:/ { printing = 1; next }
        /Signature Algorithm:/ { printing = 0 }
        printing {
            line = $0
            # Replace known OIDs with readable names
            for (oid in oid_names) {
                if (line ~ oid) {
                    sub(oid ":", oid_names[oid] ":", line)
                }
            }
            print indent "    " line
        }
    '
}

# Function to display certificate information
show_certificate_info() {
   local cert_file="$1"
   local indent="$2"
   local role="$3"
   
   # Print certificate role if provided
   if [ ! -z "$role" ]; then
       echo -e "\n${indent}${MAGENTA}${BOLD}[$role]${NC}"
   fi
   
   # Get certificate details
   local subject
   local issuer
   subject=$(openssl x509 -in "$cert_file" -noout -subject | sed 's/^subject=//')
   issuer=$(openssl x509 -in "$cert_file" -noout -issuer | sed 's/^issuer=//')
   
   # Check if self-signed
   if [ "$subject" = "$issuer" ]; then
       print_field "Certificate Type" "Self-signed" "$indent    " "$YELLOW"
   fi
   
   print_field "Subject" "$subject" "$indent" "$CYAN"
   print_field "Issuer" "$issuer" "$indent" "$CYAN"
   
   echo -e "${indent}${BOLD}Validity:${NC}"
   openssl x509 -in "$cert_file" -noout -dates | sed "s/^/${indent}    /" | \
       GREP_COLOR='1;32' grep --color=always -E 'not(Before|After)=|$'
   
   # Show extensions
   show_certificate_extensions "$cert_file" "$indent"
   
   echo -e "${indent}${BOLD}Fingerprints:${NC}"
   local sha1
   local sha256
   sha1=$(openssl x509 -in "$cert_file" -noout -fingerprint -sha1 | sed 's/^SHA1 Fingerprint=//')
   sha256=$(openssl x509 -in "$cert_file" -noout -fingerprint -sha256 | sed 's/^SHA256 Fingerprint=//')
   
   print_field "SHA1" "$sha1" "$indent    " "$CYAN"
   print_field "SHA256" "$sha256" "$indent    " "$CYAN"
}

# Function to verify certificate chain
verify_cert_chain() {
    local cert_file="$1"
    local bundle_file="$2"
    
    print_header "Certificate Chain Verification"
    
    # Create temporary directory
    local temp_dir
    temp_dir=$(mktemp -d)
    
    # Split bundle into separate certificates
    local chain_count=0
    local current_cert=""
    
    # Read and count certificates from bundle
    while IFS= read -r line; do
        if [[ "$line" == *"BEGIN CERTIFICATE"* ]]; then
            current_cert="$line"$'\n'
        elif [[ "$line" == *"END CERTIFICATE"* ]]; then
            current_cert+="$line"$'\n'
            chain_count=$((chain_count + 1))
            echo "$current_cert" > "${temp_dir}/chain_${chain_count}.pem"
            current_cert=""
        else
            current_cert+="$line"$'\n'
        fi
    done < "$bundle_file"
    
    # Include end certificate in total count
    local total_count=$((chain_count + 1))
    print_field "Total certificates" "$total_count" "  " "$CYAN"
    
    # Verify chain
    local chain_verify
    chain_verify=$(openssl verify -CAfile "$bundle_file" "$cert_file" 2>&1)
    local verify_status=$?
    
    echo -e "\n  ${BOLD}Chain verification result:${NC}"
    if [ $verify_status -eq 0 ]; then
        print_status "    ✓ Certificate chain verified successfully" "$GREEN"
    else
        print_status "    ✗ Chain verification failed" "$RED"
        print_status "    Details: $chain_verify" "$RED"
    fi
    
    # Show end certificate details
    print_field "\nEnd Certificate Details" "" "  " "$MAGENTA"
    show_certificate_info "$cert_file" "    "
    
    # Show intermediate certificates
    if [ $chain_count -gt 1 ]; then
        print_field "Intermediate Certificate Details" "" "  " "$MAGENTA"
        local i=1
        for cert in "${temp_dir}"/chain_*.pem; do
            if [ -f "$cert" ] && [ "$i" -lt "$chain_count" ]; then
                show_certificate_info "$cert" "    "
                ((i++))
            fi
        done
    fi
    
    # Show root certificate
    if [ $chain_count -gt 0 ]; then
        print_field "Root Certificate Details" "" "  " "$MAGENTA"
        show_certificate_info "${temp_dir}/chain_${chain_count}.pem" "    "
    fi
    
    # Cleanup
    rm -rf "$temp_dir"
}

# Function to verify signature
verify_signature() {
   print_header "Signature Verification"
   
   local data_file="$1"
   local signature_file="$2"
   local cert_file="$3"
   
   print_field "Data file" "$data_file" "  " "$CYAN"
   print_field "Signature file" "$signature_file" "  " "$CYAN"
   
   echo -e "\n  ${BOLD}Verification result:${NC}"
   local verify_result
   verify_result=$(openssl dgst -sha256 -verify \
       <(openssl x509 -in "$cert_file" -pubkey -noout) \
       -signature "$signature_file" "$data_file")
   
   if [ "$verify_result" = "Verified OK" ]; then
       print_status "    ✓ $verify_result" "$GREEN"
   else
       print_status "    ✗ $verify_result" "$RED"
   fi
   
   local hash
   hash=$(openssl dgst -sha256 "$data_file")
   print_field "Data file hash (SHA256)" "$hash" "  " "$CYAN"
}

# Function to display signed data
show_signed_data() {
   print_header "Signed Data Content"
   
   local data_file="$1"
   
   if [ -f "$data_file" ]; then
       echo -e "  ${BOLD}Content:${NC}"
       if jq '.' "$data_file" >/dev/null 2>&1; then
           jq --color-output '.' "$data_file" | sed 's/^/    /'
           print_status "\n  ✓ JSON format: Valid" "$GREEN"
       else
           sed 's/^/    /' "$data_file"
           print_status "\n  ✗ JSON format: Invalid" "$RED"
       fi
   else
       print_status "  ✗ No data file found" "$RED"
   fi
}

# Main execution
echo -e "${BOLD}${BLUE}Starting signature verification process...${NC}"
echo -e "${BOLD}${BLUE}----------------------------------------${NC}"

# Find latest files
latest_data=$(ls -t "${OUTPUT_DIR}"/data_*.json "${OUTPUT_DIR}"/*_*.json 2>/dev/null | head -1)
latest_signature=$(ls -t "${OUTPUT_DIR}"/signature_*.sig "${OUTPUT_DIR}"/*_*.sig 2>/dev/null | head -1)
cert_file="${CERTS_DIR}/order_cert.crt"
bundle_file="${CERTS_DIR}/order_cert_ca_bundle.crt"

if [ -f "$latest_data" ] && [ -f "$latest_signature" ]; then
   verify_cert_chain "$cert_file" "$bundle_file"
   verify_signature "$latest_data" "$latest_signature" "$cert_file"
   show_signed_data "$latest_data"
else
   print_status "Error: No data or signature files found to verify." "$RED"
   exit 1
fi
