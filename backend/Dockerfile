FROM node:23-slim AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml tsconfig.json ./

RUN apt-get update -y \
&& apt-get install openssl -y \
&& npm i -g pnpm \
&& pnpm install --frozen-lockfile \
&& rm -rf /var/lib/apt/lists/*

COPY . .

RUN pnpx prisma generate && pnpm build


FROM node:23-alpine
WORKDIR /app

RUN apk update && \
    apk add --no-cache curl libcurl && \
    npm i -g pnpm && \
    addgroup -S sonex_admin && \
    adduser -S sonex_admin_user -G sonex_admin

USER sonex_admin_user

COPY --from=builder --chown=sonex_admin_user:sonex_admin /app/package.json /app/package.json
COPY --from=builder --chown=sonex_admin_user:sonex_admin /app/pnpm-lock.yaml /app/pnpm-lock.yaml
COPY --from=builder --chown=sonex_admin_user:sonex_admin /app/node_modules /app/node_modules
COPY --from=builder --chown=sonex_admin_user:sonex_admin /app/prisma /app/prisma
COPY --from=builder --chown=sonex_admin_user:sonex_admin /app/dist /app/dist
COPY --from=builder --chown=sonex_admin_user:sonex_admin /app/entrypoint.sh /app/entrypoint.sh

RUN chmod +x /app/entrypoint.sh

ENV NODE_ENV=production

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=5 \
  CMD curl -silent --fail http://localhost:3000/health || exit 1


ENTRYPOINT [ "./entrypoint.sh" ]