FROM ubuntu:20.04

RUN mkdir -p /sp/inputs /sp/output /sp/run
RUN apt update \
    && apt install -y libnss-mdns libnss-myhostname lsb-release \
    && apt install -y python3.8 python3-pip libcurl4

ENTRYPOINT ["/usr/bin/python3.8", "/sp/run/entrypoint.py"]
