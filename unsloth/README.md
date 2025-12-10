# Super Protocol Unsloth

This repository contains the Super Protocol packaging of [Unsloth](https://unsloth.ai/), an open-source framework for LLM fine-tuning and reinforcement learning.

The solution allows you to run fine-tuning within Super Protocol's Trusted Execution Environment (TEE). This provides enhanced security and privacy and enables a range of [confidential collaboration](https://docs.develop.superprotocol.com/cli/guides/fine-tune) scenarios.

The repository includes a Dockerfile and a helper script `run-unsloth.sh` that facilitates workflow creation. Note that `run-unsloth.sh` does not build an image and instead uses a pre-existing solution offer.

## run-unsloth.sh

### Prerequisites

- [SPCTL](https://docs.develop.superprotocol.com/cli/): Super Protocol CLI tool and its configuration file (`config.json`).
- BNB and SPPI tokens (opBNB) to pay for transactions and orders.

Copy SPCTL’s binary and `config.json` to the `unsloth/scripts` directory inside the cloned Super-Protocol/solutions repository.

### Prepare training scripts

When preparing your training scripts, keep in mind the special file structure within the TEE:

| **Location**                                                  | **Purpose**                                                               | **Access** |
| :-                                                            | :-                                                                        | :- |
| `/sp/inputs/input-0001`<br/>`/sp/inputs/input-0002`<br/>etc.  | Possible data locations<br/> (AI model, dataset, training scripts, etc.)  | Read-only |
| `/sp/output`                                                  | Output directory for results                                              | Read and write |
| `/sp/certs`                                                   | Contains the order certificate, private key, and workloadInfo.            | Read-only |

Your scripts must find the data in `/sp/inputs` and write the results to `/sp/output`.

### Place an order

Initiate a dialog to construct and place an order:

```shell
./run-unsloth.sh
```

When prompted:

1. `Enter TEE offer id (number)`: Enter a compute offer ID. This determines the available compute resources and cost of your order. You can find the full list of available compute offers on the [Marketplace](https://marketplace.superprotocol.com/).

2. `Choose run mode`: `1) file`.

3. `Select the model option`:

- `1) Medgemma 27b (offer 15900)`: Select this option if you need an untuned MedGemma 27B.
- `2) your model`: Select this option to use another model. Further, when prompted about `Model input`, enter one of the following:
    - a path to the model's resource JSON file, if it was already uploaded with SPCTL
    - model offer ID, if the model exists on the Marketplace
    - a path to the local directory with the model to upload it using SPCTL.
- `3) no model`: No model will be used.

4. `Enter path to a .py/.ipynb file OR a directory`: Enter the path to your training script (file or directory). For a directory, select the file to run (entrypoint) when prompted. Note that you cannot reuse resource files in this step; scripts should be uploaded every time.

5. `Provide your dataset as a resource JSON path, numeric offer id, or folder path`: As with the model, enter one of the following:
- a path to the dataset's resource JSON file, if it was already uploaded with SPCTL
- dataset offer ID, if the dataset exists on the Marketplace
- a path to the local directory with the dataset to upload it using SPCTL.

6. `Upload SPCTL config file as a resource?`: Answer `N` unless you need to use SPCTL from within the TEE during the order execution. In this case, your script should run a `curl` command to download SPCTL and find the uploaded `config.json` in the `/sp/inputs/` subdirectories.

7. Wait for the order to be created and find the order ID in the output, for example:

```shell
Unsloth order id: 259126
Done.
```

### Check the order result

1. The order will take some time to complete. Check the order status:

```shell
./spctl orders get <ORDER_ID>
```

Replace `<ORDER_ID>` with your order ID.

If you lost the order ID, check all your orders to find it:

```shell
./spctl orders list --my-account --type tee
```

2. When the order status is `Done` or `Error`, download the result:

```shell
./spctl orders download-result <ORDER_ID>
```

The downloaded TAR.GZ archive contains the results in the `output` directory and execution logs.

## Dry run

```shell
./run-unsloth.sh --suggest-only
```

The option `--suggest-only` allows you to perform a dry run without actually uploading files and creating orders.

Complete the dialog, as usual; only use absolute paths.

In the output, you will see a prepared command for running the script non-interactively, allowing you to easily modify the variables and avoid re-entering the dialog. For example:

```shell
RUN_MODE=file \
RUN_DIR=/home/user/Downloads/yma-run \
RUN_FILE=sft_example.py \
DATA_RESOURCE=/home/user/unsloth/scripts/yma_data_example-data.json \
MODEL_RESOURCE=/home/user/unsloth/scripts/medgemma-27b-ft-merged.resource.json \
/home/user/unsloth/scripts/run-unsloth.sh \
--tee 8 \
--config ./config.json
```

## Jupyter Notebook

You can launch and use Jupyter Notebook instead of uploading training scripts directly.

Initiate a dialog:

```shell
./run-unsloth.sh
```

When prompted:

1. `Enter TEE offer id`: Enter a compute offer ID. This determines the available compute resources and cost of your order. You can find the full list of available compute offers on the [Marketplace](https://marketplace.superprotocol.com/). 

2. `Choose run mode`: `2) jupyter-server`.

3. `Select the model option`:

- `1) Medgemma 27b (offer 15900)`: Select this option if you need an untuned MedGemma 27B.
- `2) your model`: Select this option to use another model. Further, when prompted about `Model input`, enter one of the following:
    - a path to the model's resource JSON file, if it was already uploaded with SPCTL
    - model offer ID, if the model exists on the Marketplace
    - a path to the local directory with the model to upload it using SPCTL.
- `3) no model`: No model will be used.

4. `Enter Jupyter password` or press Enter to proceed without a password.

5. `Select domain option`:

- `1) Temporary Domain (*.superprotocol.io)` is suitable for testing and quick deployments.
- `2) Own domain` will require you to provide a domain name, TLS certificate, private key, and a tunnel server auth token.

Wait for the Tunnels Launcher order to be created.

6. `Provide your dataset as a resource JSON path, numeric offer id, or folder path`: As with the model, enter one of the following:
- a path to the dataset's resource JSON file, if it was already uploaded with SPCTL
- dataset offer ID, if the dataset exists on the Marketplace
- a path to the local directory with the dataset to upload it using SPCTL.

7. `Upload SPCTL config file as a resource?`: Answer `N` unless you need to use SPCTL from within the TEE during the order execution. In this case, your script should run a `curl` command to download SPCTL and find the uploaded `config.json` in the `/sp/inputs/` subdirectories.

8. Wait for the Jupyter order to be ready and find a link in the output; for example:

```shell
===================================================
Jupyter instance is available at: https://beja-bine-envy.superprotocol.io
===================================================
```

8. Open the link in your browser to access Jupyter’s UI.

**Note**:

The data in `/sp/output` will not be published as the order result when running the Jupyter server. To save your fine-tuning results, upload them either:
- via Python code
- using the integrated terminal in the Jupyter server
- using SPCTL with the config uploaded at Step 7.