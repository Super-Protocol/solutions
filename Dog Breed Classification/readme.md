## Introduction

Machine learning algorithm that determines the breed of a dog from a photo.

## Input

The solution requires photos of dogs you want to classify in JPG or PNG format.

Before uploading to the protocol all the files must be packed into a TAR or TAR.GZ (TGZ) archive.

Check [compatible datasets](https://github.com/Super-Protocol/datasets/tree/main/Dog%20Image%20Datasets) deployed on Super Protocol for reference.

It is possible to use several datasets simultaneously.

## Output

The solution provides output in a TAR.GZ archive. Inside the archive there are a folder for every dataset that was used as an input. For example, if two datasets were used then there would be 2 folders: input-0001 and input-0002.

Every folder contains files for all photos that were provided in the input. If classification was successful for the photo then there would be TXT file with the name of the photo. Otherwise, there would be ERROR file with the name of the photo. TXT file contains the probabilities for different dog breeds and looks like this:

```
[('Blenheim spaniel', 99.69029998779297), ('Japanese spaniel', 0.20887237787246704), ('Welsh springer spaniel', 0.036493442952632904), ('Sussex spaniel', 0.0215245820581913), ('Brittany spaniel', 0.018304437398910522)]
```

## How to download the source code

To download the source code of the solution please use [this manual](https://github.com/Super-Protocol/solutions#steps-to-download-solution).