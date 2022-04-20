FROM ubuntu:20.04

RUN mkdir -p /sp/inputs /sp/output /sp/run
RUN apt update && apt install -y curl 

RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs

ENTRYPOINT ["/usr/bin/node", "/sp/run/entrypoint.js"]
