# FROM node:23-slim AS builder

# WORKDIR /app

# # Copy monorepo-level files
# COPY ../../pnpm-*.yaml ../../package.json ./

# RUN apt-get update -y \
# && apt-get install openssl -y \
# && npm i -g pnpm \
# && pnpm install --frozen-lockfile \
# && rm -rf /var/lib/apt/lists/*

# COPY ../../packages/schemas ./packages/schemas
# COPY . ./backend

# WORKDIR /app/backend

# RUN pnpx prisma generate && pnpm build


# # ======================= #
# #    Stage 2: RUNNER      #
# # ======================= #

# FROM node:23-alpine

# RUN npm i -g pnpm && \
#     addgroup -S sonex_admin && \
#     adduser -S sonex_admin_user -G sonex_admin

# USER sonex_admin_user

# WORKDIR /app

# # Copy root-level files
# COPY --from=builder --chown=sonex_admin_user:sonex_admin /app/package.json .
# COPY --from=builder --chown=sonex_admin_user:sonex_admin /app/pnpm-lock.yaml .
# COPY --from=builder --chown=sonex_admin_user:sonex_admin /app/pnpm-workspace.yaml .
# COPY --from=builder --chown=sonex_admin_user:sonex_admin /app/node_modules .

# # Copy Schema Package
# COPY --from=builder --chown=sonex_admin_user:sonex_admin /app/packages /app/packages

# # Copy Backend (only prisma, dist folder, and entrypoint)
# COPY --from=builder --chown=sonex_admin_user:sonex_admin /app/backend/prisma /app/backend/prisma
# COPY --from=builder --chown=sonex_admin_user:sonex_admin /app/backend/dist /app/backend/dist
# COPY --from=builder --chown=sonex_admin_user:sonex_admin /app/backend/entrypoint.sh /app/backend/entrypoint.sh

# RUN chmod +x /app/backend/entrypoint.sh

# ENV NODE_ENV=production

# EXPOSE 3000
# HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=5 \
#   CMD wget --spider --quiet http://localhost:3000/health || exit 1


# ENTRYPOINT [ "./backend/entrypoint.sh" ]

# =================== #
#  Base Setup         #
# =================== #
FROM node:23-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# =================== #
#  Dependencies Stage #
# =================== #
FROM base AS deps
WORKDIR /app
# Copy monorepo-level workspace info
COPY ../../pnpm-workspace.yaml ./
COPY ../../package.json ../../pnpm-lock.yaml ./

# Copy backend and shared packages
COPY ./package.json ./apps/backend/package.json
COPY ../../packages/schemas ./packages/schemas/


# =================== #
#  Build Stage        #
# =================== #
FROM deps AS build
WORKDIR /app
COPY . .
ENV NODE_ENV=development
RUN pnpm install --filter backend...
RUN pnpm --filter backend generate 
RUN pnpm --filter backend build


# Production image
FROM node:23-alpine AS production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && \
    addgroup -S sonex_admin && \
    adduser -S sonex_admin_user -G sonex_admin

WORKDIR /app
COPY --from=build /app/package.json ./
COPY --from=build /app/pnpm-*.yaml ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/schemas ./packages/schemas
COPY --from=build /app/apps/backend/dist ./backend/dist
COPY --from=build /app/apps/backend/package.json ./backend/package.json
COPY --from=build /app/apps/backend/node_modules ./backend/node_modules
COPY --from=build /app/apps/backend/prisma ./backend/prisma
COPY --from=build /app/apps/backend/entrypoint.sh ./backend/entrypoint.sh

RUN chmod +x ./backend/entrypoint.sh
USER sonex_admin_user

ENV NODE_ENV=production
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=5 \
  CMD wget --spider --quiet http://localhost:3000/health || exit 1

ENTRYPOINT ["./backend/entrypoint.sh"]