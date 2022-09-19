## Introduction

Machine learning algorithm that determines what is shown in the picture.

## Input

The solution requires images you want to classify in JPG or PNG format.

Before uploading to the protocol all the files must be packed into a TAR or TAR.GZ (TGZ) archive.

Check [compatible datasets](https://github.com/Super-Protocol/datasets/tree/main/Image%20Classification%20Datasets) deployed on Super Protocol for reference.

It is possible to use several datasets simultaneously.

## Output

The solution provides output in a TAR.GZ archive. Inside the archive there are a folder for every dataset that was used as an input. For example, if two datasets were used then there would be 2 folders: input-0001 and input-0002.

Every folder contains an output file with classification result for all photos that were provided in the input. For each photo, the most appropriate class and its probability are saved to the file. For example, the file could look like this:

|Column 1|Column 2|Column 3|
| :- | :- | :- |
|Photo 1.jpg|jellyfish|98%|
|Photo 2.jpg|hourglass|35%|
|...|...|...|
|Photo N.jpg|mushroom|78%|

See [classes.txt](./classes.txt) for a complete list of all the classes supported by the solution.

## How to download the source code

To download the source code of the solution please use [this manual](https://github.com/Super-Protocol/solutions#steps-to-download-solution).