## Introduction

This repository contains solutions that are already deployed on Super Protocol and are available to all testnet participants. Some solutions designed for end users and require only some input data to function. Then there are base images used by other solutions which could only be accessed through [Command-line Interface (CLI)](https://github.com/Super-Protocol/spctl).

| Solution                                            | Description                                                                                                          |
| :-------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------- |
| [Python](./Python)                                  | Base image for Python solutions.                                                                                     |
| [Image Classification](./Image%20Classification)    | Machine learning algorithm that determines what is shown in the picture.                                             |
| [Face Recognition](./Face%20Recognition)            | Machine learning algorithm that calculates the probability that two photos contain the same person.                  |
| [Speech Recognition](./Speech%20Recognition)        | Machine learning algorithm that transforms speech into text.                                                         |
| [Maincraft](./Tunnel%20Client/minecraft)            | Client and server of this famous game to launch locally and on the Superprotocol                                     |
| [Superchat](./Tunnel%20Client/chat)                 | Our Super Chat solution. Check [our docs](https://docs.superprotocol.com/developers/offers/superchat/) for more info |
| [Static content](./Tunnel%20Client/static-content/) | Our default website that runs with Tunnel Launcher solution                                                          |

## Steps to download solution from resource.json file

1. Clone this repository:

   ```
   git clone https://github.com/Super-Protocol/solutions
   ```

2. Download and install [Super Protocol CLI](https://github.com/Super-Protocol/ctl) for your OS:

   Linux:

   ```
   curl -L https://github.com/Super-Protocol/ctl/releases/latest/download/spctl-linux-x64 -o spctl
   ```

   macOS:

   ```
   curl -L https://github.com/Super-Protocol/ctl/releases/latest/download/spctl-macos-x64 -o spctl
   ```

   > Windows is not supported, please use WSL

3. Download and decrypt solution using `resource.json` file in the solution directory:
   ```
   ./spctl files download resource.json ./
   ```
