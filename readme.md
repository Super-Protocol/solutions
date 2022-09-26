## Introduction

This repository contains solutions that are already deployed on Super Protocol and are available to all testnet participants. Some solutions designed for end users and require only some input data to function. Then there are base images used by other solutions which could only be accessed through [Command-line Interface (CLI)](https://github.com/Super-Protocol/spctl).

|Solution|Description|
| :- | :- |
|[Python](./Python)|Base image for Python solutions.|
|[Image Classification](./Image%20Classification)|Machine learning algorithm that determines what is shown in the picture.|
|[Face Recognition](./Face%20Recognition)|Machine learning algorithm that calculates the probability that two photos contain the same person.|
|[Speech Recognition](./Speech%20Recognition)|Machine learning algorithm that transforms speech into text.|

## Steps to download solution

1. Clone this repository
   ```
   git clone https://github.com/Super-Protocol/solutions
   ```

2. Download Super Protocol [CLI](https://github.com/Super-Protocol/spctl/releases) for your OS
   > **WARNING**: Currently the build is located in private GitHub releases, so you need GitHub account to access it

   For Linux:
   ```
   curl -o spctl  https://github.com/Super-Protocol/spctl/releases/download/<version>/spctl-linux-x64
   ```

   For MacOS:
   ```
   curl -o spctl  https://github.com/Super-Protocol/spctl/releases/download/<version>/spctl-macos-x64
   chmod 755 spctl
   ```
   > Windows is not supported, please use WSL

3. Download and decrypt solution
   ```
   ./spctl files download ./resource.json  ./
   ```