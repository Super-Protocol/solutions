ARG WORKDIR=/home/node
ARG VERSION=16-alpine

FROM node:${VERSION} as build

ARG WORKDIR

WORKDIR ${WORKDIR}

COPY ./ ./

RUN npm ci --no-audit --no-fund
RUN npm run download-spctl
RUN npm run build

FROM node:${VERSION}

ARG WORKDIR

WORKDIR ${WORKDIR}

COPY --from=build ${WORKDIR}/package*.json ${WORKDIR}/
COPY --from=build ${WORKDIR}/dist ${WORKDIR}/dist
COPY --from=build ${WORKDIR}/tools ${WORKDIR}/dist/tools

RUN npm ci --omit=dev --no-audit --no-fund

ARG BUILD_DATE
ARG BUILD_GIT_BRANCH
ARG BUILD_GIT_HASH
ARG BUILD_GIT_TAG

ENV BUILD_DATE="${BUILD_DATE}" \
  BUILD_GIT_BRANCH="${BUILD_GIT_BRANCH}" \
  BUILD_GIT_HASH="${BUILD_GIT_HASH}" \
  BUILD_GIT_TAG="${BUILD_GIT_TAG}"

LABEL superprotocol.build.date="$BUILD_DATE" \
  superprotocol.build.git_branch="$BUILD_GIT_BRANCH" \
  superprotocol.build.git_hash="$BUILD_GIT_HASH" \
  superprotocol.build.git_tag="$BUILD_GIT_TAG" \
  description="SuperProtocol Provider Provisioner" \
  maintainer="SuperProtocol"

CMD [ "node", "--enable-source-maps", "dist/index.js" ]
