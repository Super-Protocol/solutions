import os
import sys
import argparse
import json
from pathlib import Path

MODEL_EXTENSIONS = [
    '.gguf', '.bin', '.safetensors', '.pth', '.pt', '.ckpt',
    '.model', '.ggml', '.ggmlv3'
]

VRAM_KBYTES_PER_TOKEN = 3.5


def find_model_file(model_path):
    model_path = Path(model_path)

    if model_path.is_file():
        for ext in MODEL_EXTENSIONS:
            if model_path.name.endswith(ext):
                return model_path
        return None

    model_files = []
    for ext in MODEL_EXTENSIONS:
        model_files.extend(model_path.glob(f"*{ext}"))

    if not model_files:
        return None

    if len(model_files) > 1:
        return max(model_files, key=lambda x: x.stat().st_size)

    return model_files[0]


def is_sharded_model(model_path):
    model_path = Path(model_path)

    if model_path.is_file():
        return False

    parent_dir = model_path if model_path.is_dir() else model_path.parent
    shard_pattern = list(parent_dir.glob("*-[0-9][0-9][0-9][0-9][0-9]-of-*"))
    if shard_pattern:
        return True

    shard_files = list(parent_dir.glob("*.*.part"))
    if shard_files:
        return True

    model_files = []
    for ext in MODEL_EXTENSIONS:
        model_files.extend(list(parent_dir.glob(f"*.[0-9]{ext}")))

    return len(model_files) > 1


def get_model_size_and_files(model_path):
    model_path = Path(model_path)
    model_files = []

    if model_path.is_file():
        model_files.append(str(model_path))
        return model_path.stat().st_size, model_files

    parent_dir = model_path if model_path.is_dir() else model_path.parent
    total_size = 0

    shard_pattern = list(parent_dir.glob("*-[0-9][0-9][0-9][0-9][0-9]-of-*"))
    if shard_pattern:
        first_shard = shard_pattern[0]

        base_name = str(first_shard).split("-00")[0]
        total_parts = str(first_shard).split("-of-")[1].split(".")[0]
        ext = "." + str(first_shard).split(".")[-1]

        for i in range(1, int(total_parts) + 1):
            shard_name = f"{base_name}-{i:05d}-of-{total_parts}{ext}"
            shard_path = parent_dir / Path(shard_name)
            if shard_path.exists():
                total_size += shard_path.stat().st_size
                model_files.append(str(shard_path))

        return total_size, model_files

    shard_files = list(parent_dir.glob("*.*.part"))
    if shard_files:
        for file in shard_files:
            total_size += file.stat().st_size
            model_files.append(str(file))
        return total_size, model_files

    sequential_model_files = []
    for ext in MODEL_EXTENSIONS:
        sequential_model_files.extend(list(parent_dir.glob(f"*.[0-9]{ext}")))

    if sequential_model_files:
        for file in sequential_model_files:
            total_size += file.stat().st_size
            model_files.append(str(file))
        return total_size, model_files

    model_file = find_model_file(model_path)
    if model_file:
        model_files.append(str(model_file))
        return model_file.stat().st_size, model_files

    return 0, []


def calculate_max_n_ctx(model_size_bytes, available_vram_gb):
    model_size_gb = model_size_bytes / (1024 ** 3)

    if available_vram_gb <= 0:
        return 1024, 1024

    if available_vram_gb < model_size_gb:
        return 1024, 0

    vram_for_model = min(model_size_gb * 1.2, available_vram_gb * 0.85)
    vram_for_ctx = max(0, available_vram_gb - vram_for_model)

    max_tokens_vram = int((vram_for_ctx * 1024 ** 2) / VRAM_KBYTES_PER_TOKEN)

    if model_size_gb <= 5:
        if available_vram_gb < 8:
            model_based_limit = 4096
        elif available_vram_gb < 16:
            model_based_limit = 8192
        elif available_vram_gb < 24:
            model_based_limit = 16384
        elif available_vram_gb < 32:
            model_based_limit = 32768
        else:
            model_based_limit = 65536
    elif model_size_gb <= 10:
        if available_vram_gb < 16:
            model_based_limit = 4096
        elif available_vram_gb < 24:
            model_based_limit = 8192
        elif available_vram_gb < 32:
            model_based_limit = 16384
        else:
            model_based_limit = 32768
    elif model_size_gb <= 30:
        if available_vram_gb < 24:
            model_based_limit = 2048
        elif available_vram_gb < 32:
            model_based_limit = 4096
        elif available_vram_gb < 48:
            model_based_limit = 8192
        else:
            model_based_limit = 16384
    else:
        if available_vram_gb < 32:
            model_based_limit = 1024
        elif available_vram_gb < 48:
            model_based_limit = 2048
        elif available_vram_gb < 64:
            model_based_limit = 4096
        else:
            model_based_limit = 8192

    powers_of_2 = [1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072]
    suitable_ctx = 1024

    for power in powers_of_2:
        if power <= max_tokens_vram and power <= model_based_limit:
            suitable_ctx = power
        else:
            break

    return suitable_ctx, max_tokens_vram


def get_n_ctx_variants(model_size_gb):
    variants = {}
    for vram in [8, 16, 24, 32, 48, 64, 80]:
        test_n_ctx, _ = calculate_max_n_ctx(model_size_bytes=model_size_gb * (1024 ** 3),
                                            available_vram_gb=vram)
        variants[str(vram)] = test_n_ctx
    return variants


def main():
    parser = argparse.ArgumentParser(description='Calculate optimal n_ctx parameters for LLM based on available VRAM.')
    parser.add_argument('model_path', type=str, help='Path to model file or directory')
    parser.add_argument('--vram', type=float, default=0, help='Available VRAM in GB')

    args = parser.parse_args()

    result = {}

    if not os.path.exists(args.model_path):
        result["error"] = f"Path {args.model_path} does not exist"
        print(json.dumps(result, indent=2))
        return 1

    try:
        model_size_bytes, model_files = get_model_size_and_files(args.model_path)
        model_size_gb = model_size_bytes / (1024 ** 3)

        if model_size_bytes == 0 or not model_files:
            result["error"] = f"No valid model files found in {args.model_path}"
            print(json.dumps(result, indent=2))
            return 1

        if args.vram > 0 and args.vram < model_size_gb:
            result["error"] = f"Available VRAM ({args.vram} GB) is less than model size ({round(model_size_gb, 2)} GB)"
            print(json.dumps(result, indent=2))
            return 1

        n_ctx, _ = calculate_max_n_ctx(model_size_bytes, args.vram)

        result["modelFiles"] = model_files
        result["modelSize"] = round(model_size_gb, 2)
        result["vramGB"] = args.vram
        result["n_ctx"] = n_ctx

        if args.vram <= 0:
            result["variants"] = get_n_ctx_variants(model_size_gb)

        print(json.dumps(result, indent=2))

    except Exception as e:
        result["error"] = str(e)
        print(json.dumps(result, indent=2))
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main()) 