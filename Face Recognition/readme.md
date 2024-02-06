## Introduction

Machine learning algorithm that calculates the probability that two photos contain the same person.

## Input

The solution requires the following data as an input:
1. Photos of people you want to compare in JPG or PNG format.
2. A file pairs.csv that contains pairs of photos to compare (filename with format). For example, if you have a database of N photos, and you want to check if a new photo matches any of the photos in your database then your pairs.csv file should look like this:

   |Column 1|Column 2|
   | :- | :- |
   |New photo.jpg|Database photo 1.jpg|
   |New photo.jpg|Database photo 2.jpg|
   |...|...|
   |New photo.jpg|Database photo N.jpg|

Before uploading to the protocol all the files must be packed into a TAR or TAR.GZ (TGZ) archive.

Check [compatible datasets](https://github.com/Super-Protocol/datasets/tree/main/Face%20Recognition%20Datasets) deployed on Super Protocol for reference.

It is possible to use several datasets simultaneously.

## Output

The solution provides output in a TAR.GZ archive. Inside the archive there are a folder for every dataset that was used as an input. For example, if two datasets were used then there would be 2 folders: input-0001 and input-0002.

Every folder contains output.csv file and processing.error file in case there were errors during the calculation. Output file includes the same pairs that were provided in the input plus the probability that the pair of photos contains the same person. For example, the file could look like this:

|Column 1|Column 2|Column 3|
| :- | :- | :- |
|New photo.jpg|Database photo 1.jpg|98%|
|New photo.jpg|Database photo 2.jpg|3%|
|...|...|...|
|New photo.jpg|Database photo N.jpg|10%|

## How to download the source code

To download the source code of the solution please use [this manual](https://github.com/Super-Protocol/solutions#steps-to-download-solution).
