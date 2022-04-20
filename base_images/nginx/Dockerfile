FROM ubuntu/mysql:8.0-20.04_edge

RUN useradd --system --no-create-home --shell /bin/false nginx
RUN apt update -y && apt install -y nginx

WORKDIR /usr/share/nginx/html
RUN rm -rf *
COPY nginx.conf /etc/nginx/nginx.conf

ENTRYPOINT ["nginx"]
