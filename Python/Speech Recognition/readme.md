## Introduction

Machine learning algorithm that transforms speech into text.

## Input

The solution requires audio files with speech that you want to transform to text in WAV format.

Before uploading to the protocol all the files must be packed into a TAR or TAR.GZ (TGZ) archive.

Check [compatible datasets](https://github.com/Super-Protocol/datasets/tree/main/Speech%20Recognition%20Datasets) deployed on Super Protocol for reference.

It is possible to use several datasets simultaneously.

## Output

The solution provides output in a TAR.GZ archive. Inside the archive there are a folder for every dataset that was used as an input. For example, if two datasets were used then there would be 2 folders: input-0001 and input-0002.

Every folder contains TXT files for all speech files that were provided in the input. Every TXT file has the same name as the corresponding input file and contains the result of speech-to-text transformation.

## How to download the source code

To download the source code of the solution please use [this manual](https://github.com/Super-Protocol/solutions#steps-to-download-solution).