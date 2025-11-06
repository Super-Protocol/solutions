#!/usr/bin/env bash

set -euo pipefail

# Resolve script directory for invoking sibling helpers reliably
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Absolute path to this script (quoted for safe suggestion output)
SCRIPT_PATH="$SCRIPT_DIR/$(basename "${BASH_SOURCE[0]}")"
printf -v SUGGEST_SCRIPT_Q '%q' "$SCRIPT_PATH"

# Always print a short non-interactive hint on exit (success or error)
print_noninteractive_hint() {
  # Only print suggestion in suggest-only mode
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
  # Try to terminate any direct child processes of this script
  local children
  children=$(pgrep -P $$ || true)
  if [[ -n "${children:-}" ]]; then
    kill -TERM $children 2>/dev/null || true
  fi
  # Restore terminal to a sane state just in case
  stty sane 2>/dev/null || true
  exit 130
}
trap on_abort INT TERM

# Unsloth runner for Super Protocol
# - Select TEE offer id via --tee or interactive prompt
# - Environment: mainnet only (no prompt)
# - RUN_MODE: "file" or "jupyter-server" (prompt if missing)
# - If file: use RUN_FILE (prompt if missing). Validate .py or .ipynb, store basename in config
# - If jupyter-server: optionally use JUPYTER_PASSWORD; then choose domain type:
#     - Temporary domain (*.superprotocol.io): create Tunnels Launcher order and embed reference into config
#     - Own domain: read RUN_JUPYTER_SSL_CERT, RUN_JUPYTER_SSL_PRIVATE_KEY, RUN_JUPYTER_TUNNEL_SERVER_TOKEN (prompt if missing)
# - Creates solution configuration JSON and runs spctl workflows create for Unsloth solution
#
# Notes:
# - Requires a general spctl config JSON (default ./config.json) containing encryption/storage creds
# - spctl binary is searched locally similar to run-webssh-with-domain.sh
# - You MUST set UNSLOTH_SOLUTION_ID in env to the Unsloth solution id on mainnet

TEE=""
INPUT_ENV="mainnet"
CONFIG_FILE="./config.json"
ADDITIONAL_PARAMS=""

# Constants copied from run-webssh-with-domain.sh for mainnet
TUNNELS_LAUNCHER_SOLUTION_MAINNET="19"
UNSLOTH_SOLUTION_MAINNET="20449"

usage() {
  cat <<EOF
Usage: ${0##*/} [--tee <number>] [--config <file>] [--use-configuration <file>] [--suggest-only]

Environment variables (interactive prompts if missing):
  RUN_MODE                      "file" or "jupyter-server"
  RUN_FILE                      When RUN_MODE=file: either a path to .py/.ipynb file, or a filename inside RUN_DIR
  RUN_DIR                       Optional when RUN_MODE=file and selecting from a directory; absolute or relative path
  JUPYTER_PASSWORD             Password for Jupyter (optional)
  RUN_JUPYTER_DOMAIN           Domain for own-domain mode (e.g., my.lab.example.com)
  RUN_JUPYTER_SSL_CERT         PEM certificate string or path to file (own-domain)
  RUN_JUPYTER_SSL_PRIVATE_KEY  PEM private key string or path to file (own-domain)
  RUN_JUPYTER_TUNNEL_SERVER_TOKEN Auth token for tunnel server (own-domain)
  DATA_DIR                     Path to data folder to upload and attach (optional) [alias: DATA_PATH]
  MODEL_DIR                    Path to model folder to upload and attach (optional)
  DATA_RESOURCE                Path to existing uploaded data resource JSON (skip upload) (optional)
  MODEL_RESOURCE               Path to existing uploaded model resource JSON (skip upload), a numeric offer id, or 'none' to skip model (optional)

Options:
  --tee <number>               TEE offer id to use for Unsloth
  --config <file>              Path to general spctl config (default: ./config.json)
  --use-configuration <file>   Use existing Unsloth configuration JSON and skip tunnels launcher creation
  --suggest-only               Build prompts and show non-interactive command, but skip any spctl calls and file writes
  -h, --help                   Show this help
EOF
}

# Parse arguments (optional, keep minimal)
while [[ $# -gt 0 ]]; do
  case "$1" in
    --tee)
      val="$2"
      # Handle accidental concatenation like: --tee 2--additional-params=...
      if [[ "$val" =~ ^([0-9]+)(--.*)$ ]]; then
        TEE="${BASH_REMATCH[1]}"
        remainder="${BASH_REMATCH[2]}"
        shift 2
        set -- "$remainder" "$@"
      else
        TEE="$val"; shift 2
      fi
      ;;
    --tee=*)
      val="${1#*=}"
      if [[ "$val" =~ ^([0-9]+)(--.*)$ ]]; then
        TEE="${BASH_REMATCH[1]}"
        remainder="${BASH_REMATCH[2]}"
        shift 1
        set -- "$remainder" "$@"
      else
        TEE="$val"; shift 1
      fi
      ;;
    --config)
      CONFIG_FILE="$2"; shift 2 ;;
    --config=*)
      CONFIG_FILE="${1#*=}"; shift 1 ;;
    --use-configuration)
      USE_CONFIGURATION="$2"; shift 2 ;;
    --use-configuration=*)
      USE_CONFIGURATION="${1#*=}"; shift 1 ;;
    --suggest-only)
      SUGGEST_ONLY=1; shift 1 ;;
    --additional-params|--addtional-params)
      ADDITIONAL_PARAMS="$2"; shift 2 ;;
    --additional-params=*|--addtional-params=*)
      ADDITIONAL_PARAMS="${1#*=}"; shift 1 ;;
    -h|--help)
      usage; exit 0 ;;
    *)
      echo "Unknown parameter: $1" >&2
      usage; exit 1 ;;
  esac
done

echo "Step 1: Looking for spctl binary..."
SPCTL=""
if [[ -z "${SUGGEST_ONLY:-}" ]]; then
  for binary in "spctl" "spctl-linux-x64" "spctl-macos-arm64" "spctl-macos-x64"; do
    for base in "$SCRIPT_DIR" "$PWD"; do
      if [[ -f "$base/$binary" ]]; then
        SPCTL="$base/$binary"
        break 2
      fi
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

# If a prebuilt configuration is provided, validate and use it directly
if [[ -n "${USE_CONFIGURATION:-}" ]]; then
  if [[ ! -f "$USE_CONFIGURATION" ]]; then
    echo "Error: Provided --use-configuration file does not exist: $USE_CONFIGURATION" >&2
    exit 1
  fi
  CONFIG_JSON_PATH="$USE_CONFIGURATION"
fi

echo "Step 3: Selecting TEE offer..."
if [[ -z "$TEE" ]]; then
  read -r -p "Enter TEE offer id (number): " TEE
fi
if [[ -z "$TEE" || ! "$TEE" =~ ^[0-9]+$ ]]; then
  echo "Error: invalid TEE offer id. It must be a number." >&2
  exit 1
fi

echo "Step 4: Selecting run mode..."
RUN_MODE_LOWER="${RUN_MODE:-}"
if [[ -z "${RUN_MODE_LOWER}" && -z "${CONFIG_JSON_PATH:-}" ]]; then
  echo "Choose run mode:"
  select choice in "file" "jupyter-server"; do
    case $choice in
      file|jupyter-server) RUN_MODE_LOWER="$choice"; break ;;
      *) echo "Please select 1 or 2" ;;
    esac
  done
fi

# Collect data descriptors to attach via repeated --data flags
declare -a DATA_DESCRIPTORS=()
declare -a SUGGEST_ENV=()
declare -a SUGGEST_ARGS=()

# Step 4.1: Model selection options (skip if MODEL_RESOURCE pre-set via env/args)
if [[ -z "${MODEL_RESOURCE:-}" ]]; then
  MODEL_CHOICE=""
  echo "Step 4.1: Select model option:" 
  select mchoice in "Medgemma 27b (offer 15900)" "your model" "no model"; do
    case $mchoice in
      "Medgemma 27b (offer 15900)") MODEL_CHOICE="medgemma"; break ;;
      "your model") MODEL_CHOICE="your"; break ;;
      "no model") MODEL_CHOICE="none"; break ;;
      *) echo "Please select 1, 2 or 3" ;;
    esac
  done

  if [[ "$MODEL_CHOICE" == "medgemma" ]]; then
    # Use the marketplace/model offer id instead of uploading a JSON descriptor
    echo "Selected Medgemma 27b (offer 15900): will attach --data 15900"
    DATA_DESCRIPTORS+=("15900")
    # set MODEL_RESOURCE so later processing treats it as an existing resource
    MODEL_RESOURCE="15900"
  elif [[ "$MODEL_CHOICE" == "none" ]]; then
    # Explicitly record no-model selection to avoid later prompts and include in Tip
    MODEL_RESOURCE="none"
  elif [[ "$MODEL_CHOICE" == "your" ]]; then
    echo "Provide your model as one of: resource JSON path, numeric offer id, or folder path"
    read -r -p "Model input: " MODEL_USER_INPUT || true
    if [[ -n "$MODEL_USER_INPUT" ]]; then
      if [[ "$MODEL_USER_INPUT" =~ ^[0-9]+$ ]]; then
        MODEL_RESOURCE="$MODEL_USER_INPUT"
      elif [[ -f "$MODEL_USER_INPUT" ]]; then
        # Assume resource JSON; later block will validate/attach
        MODEL_RESOURCE="$MODEL_USER_INPUT"
      elif [[ -d "$MODEL_USER_INPUT" ]]; then
        MODEL_DIR="$MODEL_USER_INPUT"
      else
        echo "Warning: provided model input not found, proceeding to later prompts..."
      fi
    fi
  fi
fi

if [[ -z "${CONFIG_JSON_PATH:-}" && "$RUN_MODE_LOWER" != "file" && "$RUN_MODE_LOWER" != "jupyter-server" ]]; then
  echo "Error: RUN_MODE must be 'file' or 'jupyter-server'" >&2
  exit 1
fi

# Prepare engine settings JSON snippet
ENGINE_JSON=""
RUN_MODE_HUMAN=""

# helpers to collect suggestion parts
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
add_env_kv() {
  local name="$1"; shift
  local val="$1"; shift || true
  if [[ -n "$val" ]]; then
    local q
    printf -v q '%q' "$val"
    SUGGEST_ENV+=("${name}=${q}")
  fi
}
add_env_kv_once() {
  local name="$1"; shift
  local val="$1"; shift || true
  if [[ -z "$val" ]]; then
    return 0
  fi
  local q
  printf -v q '%q' "$val"
  local candidate="${name}=${q}"
  local existing
  for existing in "${SUGGEST_ENV[@]:-}"; do
    if [[ "$existing" == "$candidate" ]]; then
      return 0
    fi
  done
  SUGGEST_ENV+=("$candidate")
}
add_arg_kv() {
  local flag="$1"; shift
  local val="$1"; shift || true
  if [[ -n "$val" ]]; then
    if [[ "$flag" == "--additional-params" || "$flag" == "--addtional-params" ]]; then
      # Show exactly as provided: --additional-params="..."
      local vq
      vq="${val//\"/\\\"}"
      SUGGEST_ARGS+=("${flag}=\"${vq}\"")
    else
      local q
      printf -v q '%q' "$val"
      SUGGEST_ARGS+=("${flag} ${q}")
    fi
  fi
}

# Same as add_arg_kv but avoids adding duplicates to SUGGEST_ARGS
add_arg_kv_once() {
  local flag="$1"; shift
  local val="$1"; shift || true
  if [[ -z "$val" ]]; then
    return 0
  fi
  local candidate
  if [[ "$flag" == "--additional-params" || "$flag" == "--addtional-params" ]]; then
    local vq
    vq="${val//\"/\\\"}"
    candidate="${flag}=\"${vq}\""
  else
    local q
    printf -v q '%q' "$val"
    candidate="${flag} ${q}"
  fi
  # check if candidate already present
  local existing
  for existing in "${SUGGEST_ARGS[@]:-}"; do
    if [[ "$existing" == "$candidate" ]]; then
      return 0
    fi
  done
  SUGGEST_ARGS+=("$candidate")
}

# Ensure RUN_MODE is captured for Tip after helpers are defined (if already chosen)
if [[ -n "${RUN_MODE_LOWER:-}" ]]; then
  add_env_kv_once RUN_MODE "$RUN_MODE_LOWER"
fi

# Pre-collect provided flags so Tip includes them even if interrupted early
if [[ -n "${TEE:-}" ]]; then add_arg_kv_once --tee "$TEE"; fi
if [[ -n "${CONFIG_FILE:-}" ]]; then add_arg_kv_once --config "$CONFIG_FILE"; fi
if [[ -n "${USE_CONFIGURATION:-}" ]]; then add_arg_kv_once --use-configuration "$USE_CONFIGURATION"; fi
if [[ -n "${ADDITIONAL_PARAMS:-}" ]]; then add_arg_kv_once --additional-params "$ADDITIONAL_PARAMS"; fi

# (Suggestion will reflect MODEL_RESOURCE later in the unified handler)

if [[ -z "${CONFIG_JSON_PATH:-}" && "$RUN_MODE_LOWER" == "file" ]]; then
  echo "Step 5: Collecting file run options..."
  INPUT_PATH="${RUN_FILE_PATH:-${RUN_FILE:-}}"
  # Non-interactive fast-path: if RUN_DIR and RUN_FILE are provided, use them together
  if [[ -z "${RUN_FILE_PATH:-}" && -n "${RUN_DIR:-}" && -n "${RUN_FILE:-}" ]]; then
    RUN_DIR_ABS="$(cd "${RUN_DIR}" 2>/dev/null && pwd || true)"
    if [[ -z "${RUN_DIR_ABS:-}" || ! -d "${RUN_DIR_ABS}" ]]; then
      echo "Error: RUN_DIR is not a directory: ${RUN_DIR:-}" >&2
      exit 1
    fi
    RUN_FILE_BASENAME="$(basename -- "${RUN_FILE}")"
    FULL_PATH="${RUN_DIR_ABS}/${RUN_FILE_BASENAME}"
    if [[ ! -f "$FULL_PATH" ]]; then
      echo "Error: File not found in RUN_DIR: $FULL_PATH" >&2
      exit 1
    fi
    RUN_FILE_DIRNAME="$RUN_DIR_ABS"
    DIR_SELECTED=1
    # Record provided envs for Tip
    add_env_kv_once RUN_DIR "$RUN_FILE_DIRNAME"
    add_env_kv_once RUN_FILE "$RUN_FILE_BASENAME"
  else
    if [[ -z "$INPUT_PATH" ]]; then
      read -r -p "Enter path to a .py/.ipynb file OR a directory: " INPUT_PATH
    fi
    if [[ -z "$INPUT_PATH" ]]; then
      echo "Error: RUN_FILE not provided" >&2
      exit 1
    fi
  fi
  add_env_kv_once RUN_MODE "$RUN_MODE_LOWER"

  if [[ "${DIR_SELECTED:-0}" -eq 1 ]]; then
    : # already set RUN_FILE_BASENAME, RUN_FILE_DIRNAME, FULL_PATH above
  elif [[ -d "$INPUT_PATH" ]]; then
    # Directory mode: list first 10 .py/.ipynb files and let user select by number or filename
    RUN_DIR_ABS="$(cd "$INPUT_PATH" && pwd)"
    DIR_SELECTED=0
    while true; do
      # Collect first-level .py/.ipynb files (portable across macOS/Linux)
      CANDIDATES=()
      for _f in "$RUN_DIR_ABS"/*.py "$RUN_DIR_ABS"/*.ipynb; do
        if [[ -f "$_f" ]]; then
          CANDIDATES+=("$(basename -- "$_f")")
        fi
      done
      # Sort and limit to first 10 entries
      if [[ ${#CANDIDATES[@]} -gt 0 ]]; then
        IFS=$'\n' read -r -d '' -a CANDIDATES < <(printf '%s\n' "${CANDIDATES[@]}" | sort | head -n 10 && printf '\0')
      fi
      if [[ ${#CANDIDATES[@]} -eq 0 ]]; then
        echo "No .py or .ipynb files found in $RUN_DIR_ABS"
        read -r -p "Type a filename present in this directory, or press Enter to choose a different path: " TRY_NAME || true
        if [[ -z "$TRY_NAME" ]]; then
          # reprompt for input path
          read -r -p "Enter path to a .py/.ipynb file OR a directory: " INPUT_PATH
          if [[ -z "$INPUT_PATH" ]]; then echo "Error: RUN_FILE not provided" >&2; exit 1; fi
          if [[ -d "$INPUT_PATH" ]]; then RUN_DIR_ABS="$(cd "$INPUT_PATH" && pwd)"; continue; fi
          # fall back to file path processing
          FULL_PATH="$(abs_path "$INPUT_PATH")"
          RUN_FILE_BASENAME="$(basename -- "$FULL_PATH")"
          RUN_FILE_DIRNAME="$(cd "$(dirname -- "$FULL_PATH")" && pwd)"
          break
        else
          if [[ -f "$RUN_DIR_ABS/$TRY_NAME" ]]; then
            RUN_FILE_BASENAME="$TRY_NAME"
            RUN_FILE_DIRNAME="$RUN_DIR_ABS"
            FULL_PATH="$RUN_DIR_ABS/$RUN_FILE_BASENAME"
            DIR_SELECTED=1
            break
          else
            echo "File not found: $TRY_NAME"
            continue
          fi
        fi
      fi
      echo "Select a file to run (first 10 shown):"
      i=1
      for f in "${CANDIDATES[@]}"; do
        echo "  $i) $f"
        i=$((i+1))
      done
      read -r -p "Enter number or filename: " CHOICE
      if [[ "$CHOICE" =~ ^[0-9]+$ ]] && (( CHOICE >= 1 && CHOICE <= ${#CANDIDATES[@]} )); then
        RUN_FILE_BASENAME="${CANDIDATES[$((CHOICE-1))]}"
        RUN_FILE_DIRNAME="$RUN_DIR_ABS"
        FULL_PATH="$RUN_DIR_ABS/$RUN_FILE_BASENAME"
        DIR_SELECTED=1
        break
      else
        # treat as filename
        if [[ -f "$RUN_DIR_ABS/$CHOICE" ]]; then
          RUN_FILE_BASENAME="$CHOICE"
          RUN_FILE_DIRNAME="$RUN_DIR_ABS"
          FULL_PATH="$RUN_DIR_ABS/$RUN_FILE_BASENAME"
          DIR_SELECTED=1
          break
        else
          echo "No such file in directory: $CHOICE"
        fi
      fi
    done
    # Suggestions: record DIR and filename envs
    add_env_kv_once RUN_DIR "$RUN_FILE_DIRNAME"
    add_env_kv_once RUN_FILE "$RUN_FILE_BASENAME"
  else
    # File path mode
    FULL_PATH="$(abs_path "$INPUT_PATH")"
    RUN_FILE_BASENAME="$(basename -- "$FULL_PATH")"
    RUN_FILE_DIRNAME="$(cd "$(dirname -- "$FULL_PATH")" && pwd)"
    add_env_kv_once RUN_FILE_PATH "$FULL_PATH"
  fi

  # Validate extension
  case "$RUN_FILE_BASENAME" in
    *.py|*.ipynb) ;;
    *) echo "Error: RUN_FILE must end with .py or .ipynb" >&2; exit 1 ;;
  esac

  RUN_TS="$(date +%s)"
  if [[ "${DIR_SELECTED:-0}" -eq 1 ]]; then
    # When a directory was chosen, upload the entire directory; filename still points to the chosen file inside it
    DIR_BASE_NAME="$(basename -- "$RUN_FILE_DIRNAME")"
    STORJ_NAME="${DIR_BASE_NAME}-run-${RUN_TS}"
    DATA_JSON_NAME="${DIR_BASE_NAME}-run.json"
    UPLOAD_SOURCE="$RUN_FILE_DIRNAME"
    echo "Step 5.1: Preparing run directory upload (no archiving)..."
    if [[ -z "${SUGGEST_ONLY:-}" ]]; then
      echo "Step 5.2: Uploading run directory via spctl files upload..."
      "$SPCTL" files upload "$UPLOAD_SOURCE" --filename "$STORJ_NAME" --output "$DATA_JSON_NAME" --config "$CONFIG_FILE" --use-addon
      echo "Upload descriptor saved to: $DATA_JSON_NAME"
    else
      echo "Suggest-only: would upload folder $UPLOAD_SOURCE as name $STORJ_NAME and produce $DATA_JSON_NAME"
    fi
  else
    # Single file upload
    RUN_FILE_BASE_NO_EXT="${RUN_FILE_BASENAME%.*}"
    STORJ_NAME="${RUN_FILE_BASE_NO_EXT}-${RUN_TS}"
    DATA_JSON_NAME="${RUN_FILE_BASE_NO_EXT}.json"
    UPLOAD_SOURCE="$FULL_PATH"
    echo "Step 5.1: Preparing run file upload (no archiving)..."
    if [[ -z "${SUGGEST_ONLY:-}" ]]; then
      echo "Step 5.2: Uploading run file via spctl files upload..."
      "$SPCTL" files upload "$UPLOAD_SOURCE" --filename "$STORJ_NAME" --output "$DATA_JSON_NAME" --config "$CONFIG_FILE" --use-addon
      echo "Upload descriptor saved to: $DATA_JSON_NAME"
    else
      echo "Suggest-only: would upload $UPLOAD_SOURCE as name $STORJ_NAME and produce $DATA_JSON_NAME"
    fi
  fi

  # Remember the data json descriptor to attach to the workflow creation
  DATA_DESCRIPTORS+=("$(abs_path "$DATA_JSON_NAME")")
  RUN_MODE_HUMAN="Run file"
  ENGINE_JSON=$(cat <<JSON
    "engine": {
      "main_settings": {
        "run_mode": "${RUN_MODE_HUMAN}",
        "run_file_options": {
          "filename": "${RUN_FILE_BASENAME}"
        }
      }
    }
JSON
)
elif [[ -z "${CONFIG_JSON_PATH:-}" && "$RUN_MODE_LOWER" == "jupyter-server" ]]; then
  echo "Step 5: Collecting jupyter-server run options..."
  JUPYTER_PASSWORD_VALUE="${JUPYTER_PASSWORD:-}"
  if [[ -z "$JUPYTER_PASSWORD_VALUE" ]]; then
    read -r -p "Enter Jupyter password (optional, press Enter to skip): " JUPYTER_PASSWORD_VALUE || true
  fi
  add_env_kv_once RUN_MODE "$RUN_MODE_LOWER"
  add_env_kv_once JUPYTER_PASSWORD "$JUPYTER_PASSWORD_VALUE"
  # jq is required to safely encode password in JSON
  if ! command -v jq >/dev/null 2>&1; then
    echo "Error: 'jq' is required to encode Jupyter password into JSON. Please install jq and retry." >&2
    exit 1
  fi
  RUN_MODE_HUMAN="Jupyter"
  ENGINE_JSON=$(cat <<JSON
    "engine": {
      "main_settings": {
        "run_mode": "${RUN_MODE_HUMAN}",
        "run_jupyter_options": {
          "password": $(jq -rn --arg v "$JUPYTER_PASSWORD_VALUE" '$v|@json'),
          "start_dir": "/sp"
        }
      }
    }
JSON
)
fi

TUNNELS_JSON=""
LAUNCHER_ORDER_ID=""

if [[ -z "${CONFIG_JSON_PATH:-}" && "$RUN_MODE_LOWER" == "jupyter-server" ]]; then
  echo "Step 6: Choosing domain type for Jupyter server..."
  DOMAIN_TYPE=""
  echo "Select domain option:"
  select dchoice in "Temporary Domain (*.superprotocol.io)" "Own domain"; do
    case $dchoice in
      "Temporary Domain (*.superprotocol.io)") DOMAIN_TYPE="temporary"; break ;;
      "Own domain") DOMAIN_TYPE="own"; break ;;
      *) echo "Please select 1 or 2" ;;
    esac
  done

  if [[ "$DOMAIN_TYPE" == "temporary" ]]; then
    if [[ -z "${SUGGEST_ONLY:-}" ]]; then
      echo "Step 6.1: Parsing encryption key and storage credentials from $CONFIG_FILE ..."
      ENCRYPTION_KEY=$(awk -F '"' '/"workflow"/{f=1} f&&/"resultEncryption"/{f=2} f==2&&/"key"/{print $4;exit}' "$CONFIG_FILE")
      if [[ -z "$ENCRYPTION_KEY" ]]; then
        echo "Error: Could not parse encryption key from config" >&2
        exit 1
      fi
      STORAGE_BLOCK=$(awk '/"storage"[[:space:]]*:[[:space:]]*\{/,/\}/ {print}' "$CONFIG_FILE")
      STORAGE_TYPE=$(echo "$STORAGE_BLOCK" | awk -F '"' '/"type"[[:space:]]*:/ {print $4; exit}')
      STORAGE_BUCKET=$(echo "$STORAGE_BLOCK" | awk -F '"' '/"bucket"[[:space:]]*:/ {print $4; exit}')
      STORAGE_PREFIX=$(echo "$STORAGE_BLOCK" | awk -F '"' '/"prefix"[[:space:]]*:/ {print $4; exit}')
      STORAGE_READ_TOKEN=$(echo "$STORAGE_BLOCK" | awk -F '"' '/"readAccessToken"[[:space:]]*:/ {print $4; exit}')
      if [[ -z "$STORAGE_TYPE" || -z "$STORAGE_BUCKET" || -z "$STORAGE_READ_TOKEN" ]]; then
        echo "Error: Could not parse storage credentials (type/bucket/readAccessToken) from config" >&2
        exit 1
      fi

      echo "Step 6.2: Creating Tunnels Launcher order on $INPUT_ENV ..."
      SPCTL_CMD="$SPCTL workflows create --tee 7 --solution $TUNNELS_LAUNCHER_SOLUTION_MAINNET --config $CONFIG_FILE"
      if [[ -n "$ADDITIONAL_PARAMS" ]]; then
        SPCTL_CMD="$SPCTL_CMD $ADDITIONAL_PARAMS"
      fi
      output=$($SPCTL_CMD)
      LAUNCHER_ORDER_ID=$(echo "$output" | awk -F '"' '/TEE order id:/ {print $2; exit}')
      if [[ ! "$LAUNCHER_ORDER_ID" =~ ^[0-9]+$ ]]; then
        echo "Error: Failed to parse launcher order ID" >&2
        echo "$output" >&2
        exit 1
      fi
      echo "Tunnels Launcher order id: $LAUNCHER_ORDER_ID"

      TUNNELS_JSON=$(cat <<JSON
        "tunnels": {
          "domain_settings": {
            "provision_type": "Temporary Domain (on *.superprotocol.io)",
            "tunnel_provisioner_order": {
              "order_id": "$LAUNCHER_ORDER_ID",
              "order_key": "$ENCRYPTION_KEY",
              "credentials": {
                "type": "$STORAGE_TYPE",
                "bucket": "$STORAGE_BUCKET",
                "prefix": "$STORAGE_PREFIX",
                "token": "$STORAGE_READ_TOKEN"
              }
            }
          }
        }
JSON
)
    else
      echo "Suggest-only: skipping tunnels launcher creation and config wiring"
    fi
  else
    echo "Step 6.1: Collecting own-domain TLS and token..."
    DOMAIN_VALUE="${RUN_JUPYTER_DOMAIN:-}"
    if [[ -z "$DOMAIN_VALUE" ]]; then
      read -r -p "Enter domain (e.g., lab.example.com): " DOMAIN_VALUE
    fi
    # jq is required to JSON-escape PEM content
    if ! command -v jq >/dev/null 2>&1; then
      echo "Error: 'jq' is required for own-domain mode to format JSON strings. Please install jq and retry." >&2
      exit 1
    fi
    # Read cert/key/token (accept file path or direct PEM/text)
    read_content_or_file() {
      local var_value="$1"
      if [[ -f "$var_value" ]]; then
        cat "$var_value"
      else
        printf "%s" "$var_value"
      fi
    }
    CERT_RAW="${RUN_JUPYTER_SSL_CERT:-}"
    if [[ -z "$CERT_RAW" ]]; then
      echo "Paste PEM TLS certificate (end with Ctrl-D):"
      CERT_RAW=$(cat)
    fi
    KEY_RAW="${RUN_JUPYTER_SSL_PRIVATE_KEY:-}"
    if [[ -z "$KEY_RAW" ]]; then
      echo "Paste PEM TLS private key (end with Ctrl-D):"
      KEY_RAW=$(cat)
    fi
    TOKEN_RAW="${RUN_JUPYTER_TUNNEL_SERVER_TOKEN:-}"
    if [[ -z "$TOKEN_RAW" ]]; then
      read -r -p "Enter tunnel server auth token: " TOKEN_RAW
    fi

    CERT_VALUE=$(read_content_or_file "$CERT_RAW")
    KEY_VALUE=$(read_content_or_file "$KEY_RAW")

    # collect suggestions for own-domain
    add_env_kv RUN_JUPYTER_DOMAIN "$DOMAIN_VALUE"
    add_env_kv RUN_JUPYTER_SSL_CERT "$CERT_VALUE"
    add_env_kv RUN_JUPYTER_SSL_PRIVATE_KEY "$KEY_VALUE"
    add_env_kv RUN_JUPYTER_TUNNEL_SERVER_TOKEN "$TOKEN_RAW"

    TUNNELS_JSON=$(cat <<JSON
      "tunnels": {
        "domain_settings": {
          "provision_type": "Manual Configuration",
          "manual_domain_config": {
            "auth_token": "$TOKEN_RAW",
            "domain": "$DOMAIN_VALUE",
            "tls_certificate": $(jq -rn --arg v "$CERT_VALUE" '$v|@json'),
            "certificate_private_key": $(jq -rn --arg v "$KEY_VALUE" '$v|@json')
          }
        }
      }
JSON
)
  fi
fi

# Optional: Data attachment via DATA_RESOURCE or DATA_DIR (DATA_PATH alias supported)
DATA_RESOURCE_VALUE="${DATA_RESOURCE:-}"
if [[ -n "$DATA_RESOURCE_VALUE" ]]; then
  # Prefer existing resource if provided
  DATA_RESOURCE_ABS="$(abs_path "$DATA_RESOURCE_VALUE")"
  add_env_kv_once DATA_RESOURCE "$DATA_RESOURCE_ABS"
  if [[ -n "${SUGGEST_ONLY:-}" ]]; then
    if [[ ! -f "$DATA_RESOURCE_ABS" ]]; then
      echo "Suggest-only: DATA_RESOURCE does not exist: $DATA_RESOURCE_ABS (including in Tip anyway)"
    fi
  else
    if [[ ! -f "$DATA_RESOURCE_ABS" ]]; then
      echo "Error: DATA_RESOURCE file does not exist: $DATA_RESOURCE_ABS" >&2
      exit 1
    fi
    DATA_DESCRIPTORS+=("$DATA_RESOURCE_ABS")
  fi
else
  DATA_DIR_VALUE="${DATA_DIR:-${DATA_PATH:-}}"
  if [[ -z "$DATA_DIR_VALUE" ]]; then
    read -r -p "Provide your dataset as a resource JSON path or folder path (optional, press Enter to skip): " DATA_DIR_VALUE || true
  fi
  if [[ -n "$DATA_DIR_VALUE" ]]; then
    # Treat explicit DATA_DIR=none (case-insensitive) as skip, since suggestions include it
    case "$DATA_DIR_VALUE" in
      none|NONE|None)
        add_env_kv_once DATA_DIR "none"
        echo "Skipping dataset attachment (DATA_DIR=none)"
        ;;
      *)
    # If a JSON descriptor is provided instead of a folder, treat it as DATA_RESOURCE
    if [[ -f "$DATA_DIR_VALUE" ]] \
       && grep -q '"hash"' "$DATA_DIR_VALUE" \
       && grep -q '"encryption"' "$DATA_DIR_VALUE" \
       && grep -q '"resource"' "$DATA_DIR_VALUE"; then
      DATA_RESOURCE_ABS="$(abs_path "$DATA_DIR_VALUE")"
      add_env_kv_once DATA_RESOURCE "$DATA_RESOURCE_ABS"
      if [[ -z "${SUGGEST_ONLY:-}" ]]; then
        DATA_DESCRIPTORS+=("$DATA_RESOURCE_ABS")
      fi
    else
      # Compute descriptor name for suggestion regardless of existence
      DATA_DIR_BASE="$(basename -- "$DATA_DIR_VALUE")"
      DATA_ARCHIVE_NAME="${DATA_DIR_BASE}-data.tar.gz"
      DATA_DESCRIPTOR_NAME="${DATA_DIR_BASE}-data.json"
      # In suggestion, prefer *_RESOURCE form
      add_env_kv_once DATA_RESOURCE "$(abs_path "$DATA_DESCRIPTOR_NAME")"
      if [[ ! -d "$DATA_DIR_VALUE" ]]; then
        if [[ -n "${SUGGEST_ONLY:-}" ]]; then
          echo "Suggest-only: DATA_DIR is not a directory: $DATA_DIR_VALUE (including DATA_RESOURCE in Tip anyway)"
        else
          echo "Error: DATA_DIR is not a directory: $DATA_DIR_VALUE" >&2
          exit 1
        fi
      else
        DATA_DIR_ABS="$(cd "$DATA_DIR_VALUE" && pwd)"
        DATA_DIR_BASE="$(basename -- "$DATA_DIR_ABS")"
        DATA_TS="$(date +%s)"
        DATA_STORJ_NAME="${DATA_DIR_BASE}-data-${DATA_TS}"
        DATA_DESCRIPTOR_NAME="${DATA_DIR_BASE}-data.json"

        echo "Step 6.X: Preparing data folder upload (no archiving)..."
        if [[ -z "${SUGGEST_ONLY:-}" ]]; then
          echo "Uploading data folder via spctl files upload..."
          "$SPCTL" files upload "$DATA_DIR_ABS" --filename "$DATA_STORJ_NAME" --output "$DATA_DESCRIPTOR_NAME" --config "$CONFIG_FILE" --use-addon
          echo "Upload descriptor saved to: $DATA_DESCRIPTOR_NAME"
        else
          echo "Suggest-only: would upload folder $DATA_DIR_ABS as name $DATA_STORJ_NAME and produce $DATA_DESCRIPTOR_NAME"
        fi
        DATA_DESCRIPTORS+=("$(abs_path "$DATA_DESCRIPTOR_NAME")")
      fi
    fi
        ;;
    esac
  else
    # User skipped dataset (pressed Enter or DATA_DIR unset). Record this in Tip for reproducibility.
    add_env_kv_once DATA_DIR "none"
  fi
fi

# Optional: Model attachment via MODEL_RESOURCE or MODEL_DIR
MODEL_RESOURCE_VALUE="${MODEL_RESOURCE:-}"
if [[ -n "$MODEL_RESOURCE_VALUE" ]]; then
  if [[ "$MODEL_RESOURCE_VALUE" == "none" ]]; then
    # Sentinel meaning: explicitly no model
    add_env_kv_once MODEL_RESOURCE "none"
    # do not attach any descriptor and do not prompt for MODEL_DIR
  elif [[ "$MODEL_RESOURCE_VALUE" =~ ^[0-9]+$ ]]; then
    # Numeric offer id -> treat as direct --data <id>
    add_env_kv_once MODEL_RESOURCE "$MODEL_RESOURCE_VALUE"
    DATA_DESCRIPTORS+=("$MODEL_RESOURCE_VALUE")
  else
    MODEL_RESOURCE_ABS="$(abs_path "$MODEL_RESOURCE_VALUE")"
    add_env_kv_once MODEL_RESOURCE "$MODEL_RESOURCE_ABS"
    if [[ -n "${SUGGEST_ONLY:-}" ]]; then
      if [[ ! -f "$MODEL_RESOURCE_ABS" ]]; then
        echo "Suggest-only: MODEL_RESOURCE does not exist: $MODEL_RESOURCE_ABS (including in Tip anyway)"
      fi
    else
      if [[ ! -f "$MODEL_RESOURCE_ABS" ]]; then
        echo "Error: MODEL_RESOURCE file does not exist: $MODEL_RESOURCE_ABS" >&2
        exit 1
      fi
      DATA_DESCRIPTORS+=("$MODEL_RESOURCE_ABS")
    fi
  fi
else
  MODEL_DIR_VALUE="${MODEL_DIR:-}"
  if [[ -z "$MODEL_DIR_VALUE" ]]; then
    read -r -p "Enter path to model folder to upload (optional, press Enter to skip): " MODEL_DIR_VALUE || true
  fi
  if [[ -n "$MODEL_DIR_VALUE" ]]; then
    # If a JSON descriptor is provided instead of a folder, treat it as MODEL_RESOURCE
    if [[ -f "$MODEL_DIR_VALUE" ]] \
       && grep -q '"hash"' "$MODEL_DIR_VALUE" \
       && grep -q '"encryption"' "$MODEL_DIR_VALUE" \
       && grep -q '"resource"' "$MODEL_DIR_VALUE"; then
      MODEL_RESOURCE_ABS="$(abs_path "$MODEL_DIR_VALUE")"
      add_env_kv_once MODEL_RESOURCE "$MODEL_RESOURCE_ABS"
      if [[ -z "${SUGGEST_ONLY:-}" ]]; then
        DATA_DESCRIPTORS+=("$MODEL_RESOURCE_ABS")
      fi
    else
      # Compute descriptor name for suggestion regardless of existence
      MODEL_DIR_BASE="$(basename -- "$MODEL_DIR_VALUE")"
      MODEL_ARCHIVE_NAME="${MODEL_DIR_BASE}-model.tar.gz"
      MODEL_DESCRIPTOR_NAME="${MODEL_DIR_BASE}-model.json"
      # In suggestion, prefer *_RESOURCE form
      add_env_kv_once MODEL_RESOURCE "$(abs_path "$MODEL_DESCRIPTOR_NAME")"
      if [[ ! -d "$MODEL_DIR_VALUE" ]]; then
        if [[ -n "${SUGGEST_ONLY:-}" ]]; then
          echo "Suggest-only: MODEL_DIR is not a directory: $MODEL_DIR_VALUE (including MODEL_RESOURCE in Tip anyway)"
        else
          echo "Error: MODEL_DIR is not a directory: $MODEL_DIR_VALUE" >&2
          exit 1
        fi
      else
        MODEL_DIR_ABS="$(cd "$MODEL_DIR_VALUE" && pwd)"
        MODEL_DIR_BASE="$(basename -- "$MODEL_DIR_ABS")"
        MODEL_TS="$(date +%s)"
        MODEL_STORJ_NAME="${MODEL_DIR_BASE}-model-${MODEL_TS}"
        MODEL_DESCRIPTOR_NAME="${MODEL_DIR_BASE}-model.json"

        echo "Step 6.Y: Preparing model folder upload (no archiving)..."
        if [[ -z "${SUGGEST_ONLY:-}" ]]; then
          echo "Uploading model folder via spctl files upload..."
          "$SPCTL" files upload "$MODEL_DIR_ABS" --filename "$MODEL_STORJ_NAME" --output "$MODEL_DESCRIPTOR_NAME" --config "$CONFIG_FILE" --use-addon
          echo "Upload descriptor saved to: $MODEL_DESCRIPTOR_NAME"
        else
          echo "Suggest-only: would upload folder $MODEL_DIR_ABS as name $MODEL_STORJ_NAME and produce $MODEL_DESCRIPTOR_NAME"
        fi
        DATA_DESCRIPTORS+=("$(abs_path "$MODEL_DESCRIPTOR_NAME")")
      fi
    fi
  fi
fi

if [[ -z "${CONFIG_JSON_PATH:-}" ]]; then
  if [[ -z "${SUGGEST_ONLY:-}" ]]; then
    echo "Step 6: Building Unsloth solution configuration JSON..."
    CONFIG_JSON_PATH="unsloth-configuration${LAUNCHER_ORDER_ID:+-launcher-${LAUNCHER_ORDER_ID}}.json"

    {
      echo "{";
      # Engine (top-level)
      echo "  $ENGINE_JSON";
      # Tunnels (optional, top-level)
      if [[ -n "$TUNNELS_JSON" ]]; then
        echo "  ,$TUNNELS_JSON";
      fi
      echo "}";
    } > "$CONFIG_JSON_PATH"

    echo "Solution configuration written to: $CONFIG_JSON_PATH"
  else
    echo "Suggest-only: skipping configuration file write"
  fi
else
  echo "Step 6: Using provided configuration: $CONFIG_JSON_PATH"
fi

if [[ -z "${SUGGEST_ONLY:-}" ]]; then
  echo "Step 7: Creating Unsloth workflow order on $INPUT_ENV ..."
  CREATE_CMD="$SPCTL workflows create --tee $TEE --solution $UNSLOTH_SOLUTION_MAINNET --solution-configuration $CONFIG_JSON_PATH --config $CONFIG_FILE"
# Collect suggested args (so users can skip TEE/config prompts)
add_arg_kv_once --tee "$TEE"
add_arg_kv_once --config "$CONFIG_FILE"
if [[ -n "${USE_CONFIGURATION:-}" ]]; then
  add_arg_kv_once --use-configuration "$USE_CONFIGURATION"
fi
# Append all data descriptors (accept numeric offer ids or descriptor files)
if [[ ${#DATA_DESCRIPTORS[@]} -gt 0 ]]; then
  for d in "${DATA_DESCRIPTORS[@]}"; do
    if [[ "$d" =~ ^[0-9]+$ ]]; then
      CREATE_CMD="$CREATE_CMD --data $d"
    elif [[ -f "$d" ]]; then
      CREATE_CMD="$CREATE_CMD --data $d"
    fi
  done
fi
if [[ -n "$ADDITIONAL_PARAMS" ]]; then
  CREATE_CMD="$CREATE_CMD $ADDITIONAL_PARAMS"
  add_arg_kv_once --additional-params "$ADDITIONAL_PARAMS"
fi
unsloth_output=$($CREATE_CMD)

unsloth_order_id=$(echo "$unsloth_output" | awk -F '"' '/TEE order id:/ {print $2; exit}')
if [[ ! "$unsloth_order_id" =~ ^[0-9]+$ ]]; then
  echo "Error: Failed to parse Unsloth order ID" >&2
  echo "$unsloth_output" >&2
  exit 1
fi
echo "Unsloth order id: $unsloth_order_id"

  # If a tunnels launcher order was created (temporary domain flow), wait for domain and print it
  if [[ -n "${LAUNCHER_ORDER_ID:-}" ]]; then
    echo "Step 8: Waiting for tunnel domain from launcher order $LAUNCHER_ORDER_ID ..."
    "$SCRIPT_DIR/extract-domain.sh" --order-id "$LAUNCHER_ORDER_ID" --config "$CONFIG_FILE"
  fi
else
  # In suggest-only mode, still collect args for hint
  add_arg_kv_once --tee "$TEE"
  add_arg_kv_once --config "$CONFIG_FILE"
  if [[ -n "${USE_CONFIGURATION:-}" ]]; then
    add_arg_kv_once --use-configuration "$USE_CONFIGURATION"
  fi
  if [[ -n "$ADDITIONAL_PARAMS" ]]; then
    add_arg_kv_once --additional-params "$ADDITIONAL_PARAMS"
  fi
  echo "Suggest-only mode: skipping order creation and domain wait"
fi

echo "Done."
