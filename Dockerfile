FROM node:lts-alpine as base
ARG HTTP_PROXY
ARG HTTPS_PROXY

# setup environment
ENV NODE_ENV=production
RUN if [ ! -z "${HTTP_PROXY}" ]; then \
      npm config set proxy $HTTP_PROXY; \
      npm config set https-proxy $HTTPS_PROXY; \
    else \
      npm config delete proxy; \
      npm config delete https-proxy; \
    fi \
    && set -uex \
    && umask 0027 \
    && if [ -z "$(getent group ${APP_GROUP_ID:-1000} 2>/dev/null)" ]; then \
      addgroup -g ${APP_GROUP_ID:-1000} ${APP_GROUP_NAME:-node}; \
    fi \
    && if [ -z "$(getent passwd ${APP_USER_ID:-1000} 2>/dev/null)" ]; then \
      adduser -H -h ${APP_USER_HOME:-/app} -s /usr/sbin/nologin -G ${APP_GROUP_ID:-1000} -u ${APP_USER_ID:-1000} ${APP_USER_NAME:-node}; \
    fi
WORKDIR ${APP_USER_HOME:-/app}

FROM base as dependencies
COPY package.json package.json
COPY pnpm-lock.yaml pnpm-lock.yaml
COPY pnpm-workspace.yaml pnpm-workspace.yaml
COPY ./packages/backend/package.json ./packages/backend/package.json
# ENV NODE_EXTRA_CA_CERTS=cert-chain.cer
# install platform specific code
RUN apk add --no-cache --virtual gyp python3 make g++ \
    && npm install -g pnpm \
    && pnpm install --filter "./packages/backend..." --prod --frozen-lockfile \
    && find ./packages/ -type l -exec sh -c 'ln -sfn "$(readlink -f "{}")" "{}"' \; \
    && mv ./packages/backend/node_modules/* node_modules/

FROM base AS release
COPY --from=dependencies ${APP_USER_HOME:-/app}/node_modules ./node_modules
COPY ./packages/backend/package.json .
COPY ./packages/backend/index.js .
COPY ./packages/backend/LICENSE.txt .
COPY ./packages/backend/dist ./dist
COPY ./packages/frontend/dist ./static
RUN chown -R ${APP_USER_ID:-1000}:${APP_GROUP_ID:-1000} . \
    && npm uninstall -g npm pnpm
# COPY .env.docker .env

# run
EXPOSE 8080
# EXPOSE 9229
USER ${APP_USER_ID:-1000}:${APP_GROUP_ID:-1000}
CMD ["node","index.js"]
