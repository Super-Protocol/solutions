## Introduction

Machine learning algorithm that calculates the probability that two photos contain the same person.

## Input

The solution requires the following data as an input:

1. Photos of people you want to compare in JPG or PNG format.
2. A file pairs.csv that contains pares of photos to compare (filename with format). For example, if you have a database of N photos, and you want to check if a new photo matches any of the photos in your database then your pairs.csv file should look like this:

   | Column 1      | Column 2             |
   | :------------ | :------------------- |
   | New photo.jpg | Database photo 1.jpg |
   | New photo.jpg | Database photo 2.jpg |
   | ...           | ...                  |
   | New photo.jpg | Database photo N.jpg |

Before uploading to the protocol all the files must be packed into a TAR or TAR.GZ (TGZ) archive.

Check [compatible datasets](https://github.com/Super-Protocol/datasets/tree/main/Face%20Recognition%20Datasets) deployed on Super Protocol for reference.

It is possible to use several datasets simultaneously.

## Output

The solution provides output in a TAR.GZ archive. Inside the archive there are a folder for every dataset that was used as an input. For example, if two datasets were used then there would be 2 folders: input-0001 and input-0002.

Every folder contains output.csv file and processing.error file in case there were errors during the calculation. Output file includes the same pairs that were provided in the input plus the probability that the pair of photos contains the same person. For example, the file could look like this:

| Column 1      | Column 2             | Column 3 |
| :------------ | :------------------- | :------- |
| New photo.jpg | Database photo 1.jpg | 98%      |
| New photo.jpg | Database photo 2.jpg | 3%       |
| ...           | ...                  | ...      |
| New photo.jpg | Database photo N.jpg | 10%      |

## Local run

Make sure you have downloaded and installed

- [Docker](https://www.docker.com/products/docker-desktop/)
- [Super Protocol CLI](https://docs.superprotocol.com/developers/cli_guides/downloading)

Download our Python base image and load it tot Docker

```bash
./spctl offers download 5
docker load < python3.10-base-solution-image-0.0.4.image.tar.gz
```

Clone this repository

```bash
git clone git@github.com:Super-Protocol/solutions.git
```

Download solution to Face Recognition folder

```bash
./spctl files download solutions/Python/face-recognition/resource.json solutions/Python/face-recognition
```

Unpack downloaded solution to `run` folder

```bash
mkdir solutions/Python/face-recognition/run
tar -xzf solutions/Python/face-recognition/face-recognition-v0.7-python3.10-base.tar.gz -C solutions/Python/face-recognition/run
```

Download data to `inputs` folder from our [datasets](https://github.com/Super-Protocol/datasets) repository

```bash
mkdir -p solutions/Python/face-recognition/inputs/input-0001
curl -L https://raw.githubusercontent.com/Super-Protocol/datasets/main/Face%20Recognition%20Datasets/face-recognition-ds1.tar.gz -o solutions/Python/face-recognition/face-recognition-ds1.tar.gz
tar -xzf solutions/Python/face-recognition/face-recognition-ds1.tar.gz -C solutions/Python/face-recognition/inputs/input-0001
```

Create output directory. Script will use this directory to save result

```bash
mkdir -p solutions/Python/face-recognition/output
```

Run script with Docker

```bash
export LOCATION="solutions/Python/face-recognition"
docker run --platform linux/amd64 --rm -ti -v $PWD/$LOCATION/run:/sp/run -v $PWD/$LOCATION/inputs:/sp/inputs -v $PWD/$LOCATION/output:/sp/output  -e PYTHONPATH="${PYTHONPATH}:/sp/run/pypi/lib/python3.10/site-packages" --entrypoint /usr/bin/python3 -w /sp/run gsc-python3.10-base-solution:latest entrypoint.py
```
