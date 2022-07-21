## Steps to download solution
1. Clone this repository
   ```
   git clone https://github.com/Super-Protocol/solutions
   ```

2. Download SuperProtocol Command Line Tool for your OS from [GitHub releases](https://github.com/Super-Protocol/spctl/releases)
   > **WARNING**: Currently build located in private GitHub releases, so you need to login in your GitHub account to download it

   For Linux:
   ```
   curl -o spctl  https://github.com/Super-Protocol/spctl/releases/download/v0.0.8/spctl-linux-x64
   ```

   For MacOS:
   ```
   curl -o spctl  https://github.com/Super-Protocol/spctl/releases/download/v0.0.8/spctl-macos-x64
   chmod 755 spctl
   ```
   Windows is not supported, please use WSL
4. Download and decrypt solution you need using SuperProtocol Command Line Tool
   ```
   ./spctl files download ./'Speech Recognition'/resource.json ./SpeechRecognition.gz
   ```
5. Unzip solution
   ```
   mkdir SpeechRecognition && tar -xzf SpeechRecognition.gz -C SpeechRecognition
   ```