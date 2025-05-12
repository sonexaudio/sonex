FROM node:23-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable \ 
&& corepack prepare pnpm@latest --activate \
&& pnpm install


COPY . .
RUN pnpm build

# Runner
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Add the HEALTHCHECK to ensure the frontend is responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost || exit 1

CMD [ "nginx", "-g", "daemon off;" ]