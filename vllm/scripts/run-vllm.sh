#!/usr/bin/env bash

set -euo pipefail

# Resolve script directory for invoking sibling helpers reliably
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_PATH="$SCRIPT_DIR/$(basename "${BASH_SOURCE[0]}")"
printf -v SUGGEST_SCRIPT_Q '%q' "$SCRIPT_PATH"

# Always print a short non-interactive hint on exit (success or error)
print_noninteractive_hint() {
  if [[ -z "${SUGGEST_ONLY:-}" ]]; then
    return 0
  fi
  local suggest_env_str=""
  local suggest_args_str=""
  if [[ "${SUGGEST_ENV+x}" == "x" ]]; then
    if [[ ${#SUGGEST_ENV[@]} -gt 0 ]]; then
      for kv in "${SUGGEST_ENV[@]}"; do
        suggest_env_str+=" ${kv}"
      done
    fi
  fi
  if [[ "${SUGGEST_ARGS+x}" == "x" ]]; then
    if [[ ${#SUGGEST_ARGS[@]} -gt 0 ]]; then
      for a in "${SUGGEST_ARGS[@]}"; do
        suggest_args_str+=" ${a}"
      done
    fi
  fi
  echo ""
  echo "Tip: rerun non-interactively with the same parameters:"
  echo " ${suggest_env_str} ${SUGGEST_SCRIPT_Q}${suggest_args_str}"
}
trap print_noninteractive_hint EXIT

# Make Ctrl+C (SIGINT) and SIGTERM exit cleanly and return control to the terminal
on_abort() {
  echo ""
  echo "Aborted by user (Ctrl+C)"
  local children
  children=$(pgrep -P $$ || true)
  if [[ -n "${children:-}" ]]; then
    kill -TERM $children 2>/dev/null || true
  fi
  stty sane 2>/dev/null || true
  exit 130
}
trap on_abort INT TERM

# Constants
INPUT_ENV="mainnet"
TUNNELS_LAUNCHER_SOLUTION_MAINNET="19"
TUNNEL_SERVER_SOLUTION_MAINNET="18"
VLLM_SOLUTION_MAINNET="20450"

# Defaults
CONFIG_FILE="./config.json"
BASE_CONFIGURATION="${VLLM_BASE_CONFIGURATION:-}"
USE_CONFIGURATION="${VLLM_USE_CONFIGURATION:-}"
MODEL_INPUT="${MODEL_RESOURCE:-${MODEL_DIR:-}}"
VLLM_TEE="${VLLM_TEE:-}"
DOMAIN_TYPE="${VLLM_DOMAIN_TYPE:-}"
OWN_DOMAIN="${VLLM_DOMAIN:-${RUN_JUPYTER_DOMAIN:-}}"
TLS_CERT_PATH="${VLLM_SSL_CERT:-${RUN_JUPYTER_SSL_CERT:-}}"
TLS_KEY_PATH="${VLLM_SSL_PRIVATE_KEY:-${RUN_JUPYTER_SSL_PRIVATE_KEY:-}}"
API_KEY_VALUE="${VLLM_API_KEY:-}"
TUNNEL_RESOURCE_JSON="${TUNNEL_RESOURCE_JSON:-}"
TUNNEL_TEE="${TUNNEL_TEE:-}"
ADDITIONAL_PARAMS=""

declare -a SUGGEST_ENV=()
declare -a SUGGEST_ARGS=()

usage() {
  cat <<EOF
Usage: ${0##*/} [--config <file>] [--tee <number>] [--additional-params "..."] [--suggest-only]

Environment variables (interactive prompts if missing):
  VLLM_DOMAIN_TYPE           temporary | own
  VLLM_TEE                   TEE offer id to use for VLLM order
  MODEL_RESOURCE             Model descriptor JSON path or numeric offer id
  MODEL_DIR                  Model folder to upload as resource (alternative to MODEL_RESOURCE)
  VLLM_API_KEY               API key for frontend; if empty, a UUID will be generated
  VLLM_DOMAIN                Own domain (for domain-type=own)
  VLLM_SSL_CERT              TLS certificate file path (for domain-type=own)
  VLLM_SSL_PRIVATE_KEY       TLS private key file path (for domain-type=own)
  TUNNEL_RESOURCE_JSON       Existing uploaded resource JSON for auth-token (own domain)
  TUNNEL_TEE                 TEE for tunnel server order (own domain); if empty, random 7 or 9
  VLLM_BASE_CONFIGURATION    Path to base-configuration.json template (default resolves to vllm/scripts/base-configuration.json)
  VLLM_USE_CONFIGURATION     Use existing VLLM configuration JSON (skip building)

Options:
  --config <file>            Path to general spctl config (default: ./config.json)
  --tee <number>             TEE offer id to use for VLLM order
  --additional-params "..."  Extra args appended to spctl workflows create
  --suggest-only             Build prompts and show non-interactive command, but skip spctl calls and file writes
  -h, --help                 Show this help
EOF
}

# Helpers
abs_path() {
  local p="$1"
  if [[ -z "$p" ]]; then
    echo ""
  elif [[ "$p" = /* ]]; then
    echo "$p"
  else
    echo "$PWD/$p"
  fi
}
add_env_kv_once() {
  local name="$1"; local val="${2:-}"; if [[ -z "$val" ]]; then return 0; fi
  local q; printf -v q '%q' "$val"; local candidate="${name}=${q}"
  local e; for e in "${SUGGEST_ENV[@]:-}"; do [[ "$e" == "$candidate" ]] && return 0; done
  SUGGEST_ENV+=("$candidate")
}
add_arg_kv_once() {
  local flag="$1"; local val="${2:-}"; if [[ -z "$val" ]]; then return 0; fi
  local candidate
  if [[ "$flag" == "--additional-params" ]]; then
    local vq; vq="${val//\"/\\\"}"; candidate="${flag}=\"${vq}\""
  else
    local q; printf -v q '%q' "$val"; candidate="${flag} ${q}"
  fi
  local e; for e in "${SUGGEST_ARGS[@]:-}"; do [[ "$e" == "$candidate" ]] && return 0; done
  SUGGEST_ARGS+=("$candidate")
}
require_tool() {
  local name="$1"; if ! command -v "$name" >/dev/null 2>&1; then
    echo "Error: Required tool '$name' not found in PATH" >&2; exit 1
  fi
}
generate_uuid() {
  if command -v uuidgen >/dev/null 2>&1; then uuidgen; else
    python3 - <<'PY'
import uuid; print(str(uuid.uuid4()))
PY
  fi
}
read_file_required() {
  local p="$1"
  if [[ -z "$p" || ! -f "$p" ]]; then
    echo "Error: required file not found: $p" >&2
    exit 1
  fi
  cat "$p"
}
domain_matches_cert() {
  local domain="$1"; local cert_file="$2"
  if ! command -v openssl >/dev/null 2>&1; then return 0; fi
  local sans cn matches=1
  sans=$(openssl x509 -in "$cert_file" -noout -text 2>/dev/null | sed -n '/Subject Alternative Name/,$p' | grep -o 'DNS:[^,]*' | sed 's/DNS://g;s/^ *//;s/ *$//') || true
  cn=$(openssl x509 -in "$cert_file" -noout -subject 2>/dev/null | sed -n 's/.*CN=\([^/]*\).*/\1/p') || true
  match_host() {
    local pat="$1"; local h="$2"
    if [[ -z "$pat" ]]; then return 1; fi
    if [[ "$pat" == "*" ]]; then return 0; fi
    if [[ "$pat" == *"*"* ]]; then
      [[ "$h" == $pat ]]
      return $?
    fi
    [[ "$pat" == "$h" ]]
  }
  if [[ -n "$sans" ]]; then
    while IFS= read -r s; do
      if match_host "$s" "$domain"; then matches=0; break; fi
    done <<< "$sans"
  elif [[ -n "$cn" ]]; then
    if match_host "$cn" "$domain"; then matches=0; fi
  else
    matches=0
  fi
  return $matches
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --config) CONFIG_FILE="$2"; shift 2;;
    --config=*) CONFIG_FILE="${1#*=}"; shift 1;;
    --tee) VLLM_TEE="$2"; shift 2;;
    --tee=*) VLLM_TEE="${1#*=}"; shift 1;;
    --additional-params) ADDITIONAL_PARAMS="$2"; shift 2;;
    --additional-params=*) ADDITIONAL_PARAMS="${1#*=}"; shift 1;;
    --suggest-only) SUGGEST_ONLY=1; shift 1;;
    -h|--help) usage; exit 0;;
    *) echo "Unknown parameter: $1" >&2; usage; exit 1;;
  esac
done

# Pre-collect provided flags for Tip
if [[ -n "${CONFIG_FILE:-}" ]]; then add_arg_kv_once --config "$CONFIG_FILE"; fi
if [[ -n "${VLLM_TEE:-}" ]]; then add_arg_kv_once --tee "$VLLM_TEE"; fi
if [[ -n "${ADDITIONAL_PARAMS:-}" ]]; then add_arg_kv_once --additional-params "$ADDITIONAL_PARAMS"; fi

echo "Step 1: Looking for spctl binary..."
SPCTL=""
if [[ -z "${SUGGEST_ONLY:-}" ]]; then
  for binary in "spctl" "spctl-linux-x64" "spctl-macos-arm64" "spctl-macos-x64"; do
    for base in "$SCRIPT_DIR" "$PWD"; do
      if [[ -f "$base/$binary" ]]; then SPCTL="$base/$binary"; break 2; fi
    done
  done
  if [[ -z "$SPCTL" ]]; then
    echo "Error: No SPCTL binary found next to the script or in current directory (spctl, spctl-linux-x64, spctl-macos-arm64, spctl-macos-x64)" >&2
    exit 1
  fi
else
  echo "Suggest-only mode: skipping SPCTL discovery"
fi

echo "Step 2: Validating general config file..."
if [[ -z "${SUGGEST_ONLY:-}" ]]; then
  if [[ ! -f "$CONFIG_FILE" ]]; then
    echo "Error: Config file does not exist: $CONFIG_FILE" >&2
    exit 1
  fi
else
  echo "Suggest-only mode: skipping config file validation"
fi

# Base configuration resolution (if we need to build config)
if [[ -z "${USE_CONFIGURATION:-}" ]]; then
  if [[ -z "${BASE_CONFIGURATION:-}" ]]; then
    # Try common locations relative to this script
    if [[ -f "$SCRIPT_DIR/base-configuration.json" ]]; then
      BASE_CONFIGURATION="$SCRIPT_DIR/base-configuration.json"
    elif [[ -f "$SCRIPT_DIR/../scripts/base-configuration.json" ]]; then
      BASE_CONFIGURATION="$SCRIPT_DIR/../scripts/base-configuration.json"
    fi
  fi
  if [[ -z "${SUGGEST_ONLY:-}" ]]; then
    if [[ -z "${BASE_CONFIGURATION:-}" || ! -f "$BASE_CONFIGURATION" ]]; then
      echo "Error: base-configuration.json not found. Use --base-config to specify it." >&2
      exit 1
    fi
  fi
fi

# Step 3: Domain mode selection (interactive unless RUN_MODE provided)
echo "Step 3: Selecting domain type..."
# Prefer RUN_MODE env to avoid interactive prompt
if [[ -n "${RUN_MODE:-}" ]]; then
  DOMAIN_TYPE="$RUN_MODE"
fi
if [[ -z "${DOMAIN_TYPE:-}" && -z "${USE_CONFIGURATION:-}" ]]; then
  echo "Select domain option:"
  select dchoice in "Temporary Domain (*.superprotocol.io)" "Own domain"; do
    case $dchoice in
      "Temporary Domain (*.superprotocol.io)") DOMAIN_TYPE="temporary"; break ;;
      "Own domain") DOMAIN_TYPE="own"; break ;;
      *) echo "Please select 1 or 2" ;;
    esac
  done
fi
# Persist selection as RUN_MODE for non-interactive Tip
if [[ -n "${DOMAIN_TYPE:-}" ]]; then add_env_kv_once RUN_MODE "$DOMAIN_TYPE"; fi
if [[ "$DOMAIN_TYPE" != "temporary" && "$DOMAIN_TYPE" != "own" && -z "${USE_CONFIGURATION:-}" ]]; then
  echo "Error: domain type must be 'temporary' or 'own'" >&2
  exit 1
fi

# Ask VLLM TEE
echo "Step 4: Selecting TEE for VLLM order..."
if [[ -z "${VLLM_TEE:-}" && -z "${USE_CONFIGURATION:-}" ]]; then
  read -r -p "Enter TEE offer id for VLLM (number): " VLLM_TEE || true
fi
if [[ -z "${VLLM_TEE:-}" && -z "${USE_CONFIGURATION:-}" ]]; then
  echo "Error: invalid TEE offer id for VLLM." >&2; exit 1
fi
add_arg_kv_once --tee "$VLLM_TEE"

# Ask for model resource
echo "Step 5: Selecting model resource..."
MODEL_DESCRIPTOR=""
MODEL_INPUT="${MODEL_INPUT:-}"
if [[ -z "${MODEL_INPUT}" ]]; then
  read -r -p "Provide model as resource JSON path, numeric offer id, or folder path: " MODEL_INPUT || true
fi
if [[ -n "$MODEL_INPUT" ]]; then
  if [[ "$MODEL_INPUT" =~ ^[0-9]+$ ]]; then
    MODEL_DESCRIPTOR="$MODEL_INPUT"
  elif [[ -f "$MODEL_INPUT" ]]; then
    MODEL_DESCRIPTOR="$(abs_path "$MODEL_INPUT")"
  elif [[ -d "$MODEL_INPUT" ]]; then
    MODEL_FOLDER_ABS="$(cd "$MODEL_INPUT" && pwd)"
    add_env_kv_once MODEL_DIR "$MODEL_FOLDER_ABS"
    if [[ -z "${SUGGEST_ONLY:-}" ]]; then
      echo "Uploading model folder via spctl files upload..."
      TS_NOW="$(date +%s)"; MODEL_NAME="model-${TS_NOW}"; MODEL_JSON_OUT="model.json"
      "$SPCTL" files upload "$MODEL_FOLDER_ABS" --filename "$MODEL_NAME" --output "$MODEL_JSON_OUT" --config "$CONFIG_FILE" --use-addon
      MODEL_DESCRIPTOR="$(abs_path "$MODEL_JSON_OUT")"
    else
      echo "Suggest-only: would upload folder $MODEL_FOLDER_ABS as model.json"
      MODEL_DESCRIPTOR="$(abs_path "$MODEL_FOLDER_ABS")"
    fi
  else
    echo "Warning: Provided model input not found; proceeding without model attachment."
  fi
fi
if [[ -n "$MODEL_DESCRIPTOR" ]]; then add_env_kv_once MODEL_RESOURCE "$MODEL_DESCRIPTOR"; fi

# Ask for API key or generate
echo "Step 6: Obtaining API key..."
if [[ -z "${API_KEY_VALUE:-}" && -z "${USE_CONFIGURATION:-}" ]]; then
  read -r -p "Enter API key (press Enter to auto-generate): " API_KEY_VALUE || true
fi
if [[ -z "${API_KEY_VALUE:-}" ]]; then
  API_KEY_VALUE="$(generate_uuid)"
fi
add_env_kv_once VLLM_API_KEY "$API_KEY_VALUE"

# For configuration building we'll need jq
if [[ -z "${USE_CONFIGURATION:-}" ]]; then
  if [[ -z "${SUGGEST_ONLY:-}" ]]; then require_tool jq; fi
fi

# Launcher/Tunnel variables
LAUNCHER_ORDER_ID=""
TUNNEL_SERVER_ORDER_ID=""
TUNNEL_SERVER_IP=""
TUNNEL_SERVER_ID_FILE="tunnel-server-order.id"

if [[ -z "${USE_CONFIGURATION:-}" && "$DOMAIN_TYPE" == "temporary" ]]; then
  echo "Step 7: Creating Tunnels Launcher order on $INPUT_ENV ..."
  if [[ -z "${SUGGEST_ONLY:-}" ]]; then
    # Extract storage and encryption details from config (same approach as run-unsloth)
    ENCRYPTION_KEY=$(awk -F '"' '/"workflow"/{f=1} f&&/"resultEncryption"/{f=2} f==2&&/"key"/{print $4;exit}' "$CONFIG_FILE")
    if [[ -z "$ENCRYPTION_KEY" ]]; then echo "Error: could not find resultEncryption.key in $CONFIG_FILE" >&2; exit 1; fi
    STORAGE_BLOCK=$(awk '/"storage"[[:space:]]*:[[:space:]]*\{/,/\}/ {print}' "$CONFIG_FILE")
    STORAGE_TYPE=$(echo "$STORAGE_BLOCK" | awk -F '"' '/"type"[[:space:]]*:/ {print $4; exit}')
    STORAGE_BUCKET=$(echo "$STORAGE_BLOCK" | awk -F '"' '/"bucket"[[:space:]]*:/ {print $4; exit}')
    STORAGE_PREFIX=$(echo "$STORAGE_BLOCK" | awk -F '"' '/"prefix"[[:space:]]*:/ {print $4; exit}')
    STORAGE_READ_TOKEN=$(echo "$STORAGE_BLOCK" | awk -F '"' '/"readAccessToken"[[:space:]]*:/ {print $4; exit}')
    if [[ -z "$STORAGE_TYPE" || -z "$STORAGE_BUCKET" || -z "$STORAGE_READ_TOKEN" ]]; then
      echo "Error: storage.type/bucket/readAccessToken not found in $CONFIG_FILE" >&2; exit 1
    fi
    SPCTL_CMD="$SPCTL workflows create --tee 7 --solution $TUNNELS_LAUNCHER_SOLUTION_MAINNET --config $CONFIG_FILE"
    if [[ -n "$ADDITIONAL_PARAMS" ]]; then SPCTL_CMD="$SPCTL_CMD $ADDITIONAL_PARAMS"; fi
    output=$($SPCTL_CMD)
    LAUNCHER_ORDER_ID=$(echo "$output" | awk -F '"' '/TEE order id:/ {print $2; exit}')
    if [[ ! "$LAUNCHER_ORDER_ID" =~ ^[0-9]+$ ]]; then echo "Error: Failed to parse launcher order ID" >&2; echo "$output" >&2; exit 1; fi
    echo "Tunnels Launcher order id: $LAUNCHER_ORDER_ID"
  else
    echo "Suggest-only: would create launcher order (solution 19, tee 7)"
  fi
fi

if [[ -z "${USE_CONFIGURATION:-}" && "$DOMAIN_TYPE" == "own" ]]; then
  echo "Step 7: Collecting own-domain TLS and token..."
  if [[ -z "${OWN_DOMAIN:-}" ]]; then read -r -p "Enter domain (e.g., api.example.com): " OWN_DOMAIN; fi
  # Domain is provided via env (VLLM_DOMAIN); do not add as CLI flag in Tip
  if [[ -z "${TLS_CERT_PATH:-}" ]]; then read -r -p "Path to TLS certificate file: " TLS_CERT_PATH; fi
  if [[ -z "${TLS_KEY_PATH:-}" ]]; then read -r -p "Path to TLS private key file: " TLS_KEY_PATH; fi
  # Validate existence immediately
  if [[ ! -f "$TLS_CERT_PATH" ]]; then echo "Error: certificate file not found: $TLS_CERT_PATH" >&2; exit 1; fi
  if [[ ! -f "$TLS_KEY_PATH" ]]; then echo "Error: private key file not found: $TLS_KEY_PATH" >&2; exit 1; fi
  TLS_CERT_VALUE=$(read_file_required "$TLS_CERT_PATH")
  TLS_KEY_VALUE=$(read_file_required "$TLS_KEY_PATH")
  add_env_kv_once VLLM_DOMAIN "$OWN_DOMAIN"
  # Suggest env should store file paths, not contents
  add_env_kv_once VLLM_SSL_CERT "$TLS_CERT_PATH"
  add_env_kv_once VLLM_SSL_PRIVATE_KEY "$TLS_KEY_PATH"

  # Validate domain vs cert if possible
  if [[ -z "${SUGGEST_ONLY:-}" ]]; then
    # Use the actual certificate file for validation
    if ! domain_matches_cert "$OWN_DOMAIN" "$TLS_CERT_PATH"; then
      echo "Warning: Domain '$OWN_DOMAIN' does not seem to match certificate SAN/CN."
      read -r -p "Continue anyway? [y/N]: " _ans || true
      case "$_ans" in y|Y|yes|YES) : ;; *) echo "Aborting."; exit 1;; esac
    fi
  fi

  # Handle auth-token resource
  AUTH_TOKEN_FILE="auth-token"
  if [[ -z "${SUGGEST_ONLY:-}" && -z "${TUNNEL_RESOURCE_JSON:-}" ]]; then
    # Try to reuse if files exist
    if [[ -f "$AUTH_TOKEN_FILE" ]]; then
      found_json=$(ls -1 auth-token*.json 2>/dev/null | head -n1 || true)
      if [[ -n "$found_json" && -f "$found_json" ]]; then TUNNEL_RESOURCE_JSON="$found_json"; fi
    fi
  fi
  if [[ -z "${TUNNEL_RESOURCE_JSON:-}" ]]; then
    AUTH_TOKEN_VALUE="$(generate_uuid)"
    add_env_kv_once VLLM_AUTH_TOKEN "$AUTH_TOKEN_VALUE"
    echo "Step 7.1: Preparing auth-token and uploading as resource..."
    if [[ -z "${SUGGEST_ONLY:-}" ]]; then
      printf "%s" "$AUTH_TOKEN_VALUE" > "$AUTH_TOKEN_FILE"
      TS_NOW="$(date +%s)"; TAR_NAME="auth-token-${TS_NOW}.tar.gz"; JSON_OUT="auth-token.json"
      tar -czf "$TAR_NAME" "$AUTH_TOKEN_FILE"
      "$SPCTL" files upload "$TAR_NAME" --filename "auth-token-$TS_NOW" --output "$JSON_OUT" --config "$CONFIG_FILE" --use-addon
      TUNNEL_RESOURCE_JSON="$JSON_OUT"
    else
      echo "Suggest-only: would create auth-token file, tar.gz, and upload -> auth-token.json"
      TUNNEL_RESOURCE_JSON="auth-token.json"
    fi
  else
    echo "Reusing existing tunnel auth-token resource: $TUNNEL_RESOURCE_JSON"
  fi
  add_env_kv_once TUNNEL_RESOURCE_JSON "$TUNNEL_RESOURCE_JSON"

  # Validate or (re)create auth-token resource if file is missing
  if [[ -z "${SUGGEST_ONLY:-}" ]]; then
    if [[ -z "${TUNNEL_RESOURCE_JSON:-}" || ! -f "$(abs_path "$TUNNEL_RESOURCE_JSON")" ]]; then
      if [[ -n "${VLLM_AUTH_TOKEN:-}" ]]; then
        echo "auth-token resource JSON not found; recreating from VLLM_AUTH_TOKEN..."
        AUTH_TOKEN_VALUE="$VLLM_AUTH_TOKEN"
        printf "%s" "$AUTH_TOKEN_VALUE" > "$AUTH_TOKEN_FILE"
        TS_NOW="$(date +%s)"; TAR_NAME="auth-token-${TS_NOW}.tar.gz"; JSON_OUT="auth-token.json"
        tar -czf "$TAR_NAME" "$AUTH_TOKEN_FILE"
        "$SPCTL" files upload "$TAR_NAME" --filename "auth-token-$TS_NOW" --output "$JSON_OUT" --config "$CONFIG_FILE" --use-addon
        TUNNEL_RESOURCE_JSON="$JSON_OUT"
        add_env_kv_once TUNNEL_RESOURCE_JSON "$TUNNEL_RESOURCE_JSON"
      else
        echo "Error: auth-token resource JSON not found at '$(abs_path "$TUNNEL_RESOURCE_JSON")' and VLLM_AUTH_TOKEN not provided to recreate it." >&2
        exit 1
      fi
    fi
  fi

  # Create tunnel server order
  if [[ -z "${TUNNEL_TEE:-}" ]]; then
    # Random 7 or 9
    if [[ -z "${SUGGEST_ONLY:-}" ]]; then
      TUNNEL_TEE=$(( (RANDOM % 2 == 0) ? 7 : 9 ))
    else
      TUNNEL_TEE=7
    fi
  fi
  add_env_kv_once TUNNEL_TEE "$TUNNEL_TEE"
  # If an existing order id is provided or saved, reuse it; otherwise create a new order
  if [[ -z "${TUNNEL_SERVER_ORDER_ID:-}" && -f "$TUNNEL_SERVER_ID_FILE" ]]; then
    TUNNEL_SERVER_ORDER_ID="$(cat "$TUNNEL_SERVER_ID_FILE" | tr -d '\r\n')"
    [[ -n "$TUNNEL_SERVER_ORDER_ID" ]] && echo "Using existing Tunnel Server order id from file: $TUNNEL_SERVER_ORDER_ID"
  fi
  if [[ -n "${TUNNEL_SERVER_ORDER_ID:-}" ]]; then
    echo "Step 7.2: Using existing Tunnel Server order id: $TUNNEL_SERVER_ORDER_ID"
  else
    echo "Step 7.2: Creating Tunnel Server order (solution 18, tee $TUNNEL_TEE)..."
    if [[ -z "${SUGGEST_ONLY:-}" ]]; then
      resource_path="$(abs_path "$TUNNEL_RESOURCE_JSON")"
      SPCTL_CMD="$SPCTL workflows create --tee $TUNNEL_TEE --solution $TUNNEL_SERVER_SOLUTION_MAINNET --data $resource_path --min-rent-minutes 1000 --config $CONFIG_FILE"
      if [[ -n "$ADDITIONAL_PARAMS" ]]; then SPCTL_CMD="$SPCTL_CMD $ADDITIONAL_PARAMS"; fi
      out=$($SPCTL_CMD)
      TUNNEL_SERVER_ORDER_ID=$(echo "$out" | awk -F '"' '/TEE order id:/ {print $2; exit}')
      if [[ ! "$TUNNEL_SERVER_ORDER_ID" =~ ^[0-9]+$ ]]; then echo "Error: Failed to parse tunnel server order ID" >&2; echo "$out" >&2; exit 1; fi
      echo "Tunnel Server order id: $TUNNEL_SERVER_ORDER_ID"
      echo "$TUNNEL_SERVER_ORDER_ID" > "$TUNNEL_SERVER_ID_FILE"
    else
      echo "Suggest-only: would create tunnel server order (solution 18, tee $TUNNEL_TEE, min-rent-minutes 1000) and wait for IP JSON"
    fi
  fi
fi

# Build solution configuration JSON
CONFIG_JSON_PATH=""
if [[ -z "${USE_CONFIGURATION:-}" ]]; then
  echo "Step 8: Building VLLM solution configuration JSON..."
  CONFIG_JSON_PATH="vllm-configuration"
  if [[ -n "${LAUNCHER_ORDER_ID:-}" ]]; then CONFIG_JSON_PATH+="-launcher-${LAUNCHER_ORDER_ID}"; fi
  if [[ -n "${TUNNEL_SERVER_ORDER_ID:-}" ]]; then CONFIG_JSON_PATH+="-tunnel-${TUNNEL_SERVER_ORDER_ID}"; fi
  CONFIG_JSON_PATH+=".json"
  if [[ -z "${SUGGEST_ONLY:-}" ]]; then
    # Build configuration using jq directly to avoid here-doc parse issues
    if [[ "$DOMAIN_TYPE" == "temporary" ]]; then
      jq \
        --arg api "$API_KEY_VALUE" \
        --arg order "$LAUNCHER_ORDER_ID" \
        --arg enc "$ENCRYPTION_KEY" \
        --arg stype "$STORAGE_TYPE" \
        --arg sbucket "$STORAGE_BUCKET" \
        --arg sprefix "$STORAGE_PREFIX" \
        --arg sread "$STORAGE_READ_TOKEN" \
        '.engine.frontend.api_key = [ $api ]
         | .tunnels.domain_settings = {
             "provision_type": "Temporary Domain (on *.superprotocol.io)",
             "tunnel_provisioner_order": {
               "order_id": $order,
               "order_key": $enc,
               "credentials": {
                 "type": $stype,
                 "bucket": $sbucket,
                 "prefix": $sprefix,
                 "token": $sread
               }
             }
           }' "$BASE_CONFIGURATION" > "$CONFIG_JSON_PATH"
    else
      AUTH_TOKEN_VALUE=${AUTH_TOKEN_VALUE:-$(cat auth-token 2>/dev/null || true)}
      jq \
        --arg api "$API_KEY_VALUE" \
        --arg auth "$AUTH_TOKEN_VALUE" \
        --arg domain "$OWN_DOMAIN" \
        --arg cert "$TLS_CERT_VALUE" \
        --arg key "$TLS_KEY_VALUE" \
        '.engine.frontend.api_key = [ $api ]
         | .tunnels.domain_settings = {
             "provision_type": "Manual Configuration",
             "manual_domain_config": {
               "auth_token": $auth,
               "domain": $domain,
               "tls_certificate": $cert,
               "certificate_private_key": $key
             }
           }' "$BASE_CONFIGURATION" > "$CONFIG_JSON_PATH"
    fi
    echo "Solution configuration written to: $CONFIG_JSON_PATH"
  else
    echo "Suggest-only: skipping configuration file write"
  fi
else
  CONFIG_JSON_PATH="$USE_CONFIGURATION"
  echo "Step 8: Using provided configuration: $CONFIG_JSON_PATH"
fi

# Create VLLM order
echo "Step 9: Creating VLLM workflow order on $INPUT_ENV ..."
VLLM_ORDER_ID=""
if [[ -z "${SUGGEST_ONLY:-}" ]]; then
  CREATE_CMD="$SPCTL workflows create --tee $VLLM_TEE --solution $VLLM_SOLUTION_MAINNET --solution-configuration $CONFIG_JSON_PATH --config $CONFIG_FILE"
  if [[ -n "$MODEL_DESCRIPTOR" ]]; then CREATE_CMD="$CREATE_CMD --data $MODEL_DESCRIPTOR"; fi
  if [[ -n "$ADDITIONAL_PARAMS" ]]; then CREATE_CMD="$CREATE_CMD $ADDITIONAL_PARAMS"; fi
  out=$($CREATE_CMD)
  VLLM_ORDER_ID=$(echo "$out" | awk -F '"' '/TEE order id:/ {print $2; exit}')
  if [[ ! "$VLLM_ORDER_ID" =~ ^[0-9]+$ ]]; then echo "Error: Failed to parse VLLM order ID" >&2; echo "$out" >&2; exit 1; fi
  echo "VLLM order id: $VLLM_ORDER_ID"
else
  add_arg_kv_once --tee "$VLLM_TEE"
  echo "Suggest-only: skipping VLLM order creation"
fi

# For own-domain: after creating both orders, now wait for tunnel server result
if [[ -z "${SUGGEST_ONLY:-}" && "$DOMAIN_TYPE" == "own" ]]; then
  # If no ID from this run, try to read last known ID from file
  if [[ -z "${TUNNEL_SERVER_ORDER_ID:-}" && -f "$TUNNEL_SERVER_ID_FILE" ]]; then
    TUNNEL_SERVER_ORDER_ID="$(cat "$TUNNEL_SERVER_ID_FILE" | tr -d '\r\n' )"
  fi
  if [[ -n "${TUNNEL_SERVER_ORDER_ID:-}" ]]; then
  echo "Step 10: Waiting for tunnel server result (IP/port)..."
  dl_out=$($SPCTL orders download-result "$TUNNEL_SERVER_ORDER_ID" --config "$CONFIG_FILE" || true)
  until [[ "$dl_out" == *"Order result was saved to"* || "$dl_out" == *"Order result metadata was saved to"* ]]; do
    echo "Result not ready yet, waiting 30 seconds..."; sleep 30
    dl_out=$($SPCTL orders download-result "$TUNNEL_SERVER_ORDER_ID" --config "$CONFIG_FILE" || true)
  done
  # Fast-path: if a local result file exists (e.g., ./result.txt), use it
  if [[ -f "$SCRIPT_DIR/result.txt" ]]; then
    result_path="$SCRIPT_DIR/result.txt"
  else
    result_path=$(echo "$dl_out" | grep -oE "Order result (metadata )?was saved to .*" | sed -E 's/Order result (metadata )?was saved to //')
  fi
  if [[ ! -f "$result_path" ]]; then echo "Error: result file not found" >&2; exit 1; fi
  if command -v jq >/dev/null 2>&1; then
    TUNNEL_SERVER_IP=$(jq -r '.ip // empty' "$result_path")
  fi
  if [[ -z "$TUNNEL_SERVER_IP" ]]; then
    TUNNEL_SERVER_IP=$(grep -o '"ip"[[:space:]]*:[[:space:]]*"[^"]*' "$result_path" | sed 's/.*"\([^"]*\)$/\1/') || true
  fi
  if [[ -z "$TUNNEL_SERVER_IP" ]]; then echo "Warning: could not parse IP from tunnel server result"; fi
  else
    echo "No tunnel server order id available to fetch result."
  fi
fi

# For temporary domain: defer waiting for launcher domain until after VLLM order creation
if [[ -z "${SUGGEST_ONLY:-}" && "$DOMAIN_TYPE" == "temporary" ]]; then
  echo "Step 10: Waiting for launcher domain (order $LAUNCHER_ORDER_ID)..."
  dl_out=$($SPCTL orders download-result "$LAUNCHER_ORDER_ID" --config "$CONFIG_FILE" || true)
  until [[ "$dl_out" == *"Order result was saved to"* ]]; do
    echo "Result not ready yet, waiting 30 seconds..."; sleep 30
    dl_out=$($SPCTL orders download-result "$LAUNCHER_ORDER_ID" --config "$CONFIG_FILE" || true)
  done
  result_path=$(echo "$dl_out" | grep -o "Order result was saved to .*" | sed 's/Order result was saved to //')
  if [[ ! -f "$result_path" ]]; then echo "Error: result archive not found" >&2; exit 1; fi
  tmp_dir=$(mktemp -d); tar -xzf "$result_path" -C "$tmp_dir"
  if [[ ! -f "$tmp_dir/output/result.json" ]]; then echo "Error: result.json missing in archive" >&2; exit 1; fi
  TUNNEL_DOMAIN=$(grep -o '"domain":"[^"]*' "$tmp_dir/output/result.json" | cut -d '"' -f 4)
  rm -rf "$tmp_dir"
  if [[ -z "$TUNNEL_DOMAIN" ]]; then echo "Error: Domain not found in launcher result" >&2; exit 1; fi
fi

# Final outputs
echo ""
if [[ "$DOMAIN_TYPE" == "temporary" ]]; then
  if [[ -z "${SUGGEST_ONLY:-}" ]]; then
    echo "==================================================="
    echo "VLLM server is available at: https://$TUNNEL_DOMAIN"
    echo "API key: $API_KEY_VALUE"
    echo "Order IDs: Launcher=$LAUNCHER_ORDER_ID, VLLM=$VLLM_ORDER_ID"
    echo "==================================================="
  else
    echo "Would print superprotocol.io domain as in run-unsloth"
  fi
else
  echo "==================================================="
  echo "API key: $API_KEY_VALUE"
  if [[ -n "$TUNNEL_SERVER_IP" ]]; then
    echo "DNS records for $OWN_DOMAIN:"
    echo " - A: $TUNNEL_SERVER_IP"
    echo " - TXT: r=superprotocol;ip=$TUNNEL_SERVER_IP"
  else
    echo "Tunnel Server IP: <unknown - check order result file>"
  fi
  if [[ -z "${SUGGEST_ONLY:-}" ]]; then
    echo "Order IDs: TunnelServer=${TUNNEL_SERVER_ORDER_ID:-N/A}, VLLM=${VLLM_ORDER_ID:-N/A}"
  else
    echo "Order IDs: TunnelServer=<suggest>, VLLM=<suggest>"
  fi
  echo "==================================================="
fi

echo "Done."
