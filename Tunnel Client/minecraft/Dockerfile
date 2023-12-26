FROM node:18-slim

RUN apt update && apt upgrade -y && apt install git -y

ENV NODE_OPTIONS="--max-old-space-size=8192"

WORKDIR /app

COPY . .

RUN cd client && yarn && yarn build
RUN yarn && yarn build:all

EXPOSE 8888

CMD ["yarn", "start"]
