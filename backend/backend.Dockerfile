FROM node:22-slim

WORKDIR /app

RUN apt update -y && apt install openssl -y && npm i -g pnpm typescript

COPY package.json pnpm-lock.yaml tsconfig.json ./
COPY . .

RUN pnpm install --frozen-lockfile \
&& pnpx prisma generate 

RUN pnpm build

ENV NODE_ENV=production

EXPOSE 3000

ENTRYPOINT [ "./entrypoint.sh" ]