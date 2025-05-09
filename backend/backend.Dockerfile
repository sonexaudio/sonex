FROM node:22-slim AS builder

WORKDIR /app

RUN apt update -y && apt install openssl -y && npm i -g pnpm typescript

COPY package.json pnpm-lock.yaml tsconfig.json ./
COPY . .

RUN pnpm install --frozen-lockfile \
&& pnpx prisma generate 

RUN pnpm build

# Stage 2: Runner
FROM node:22-alpine AS runner

WORKDIR /app

# Install pnpm here and change to non-root admin
RUN npm i -g pnpm && addgroup -S sonex_admin && adduser -S sonex_admin_user -G sonex_admin

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

ENTRYPOINT [ "./entrypoint.sh" ]