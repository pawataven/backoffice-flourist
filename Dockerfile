# syntax=docker/dockerfile:1

FROM node:24-alpine AS dev
RUN npm install -g bun@1.4.0
WORKDIR /app
COPY package.json bun.lock ./
# postinstall runs `nuxt prepare`, which needs the source that is only bind-mounted at runtime.
RUN bun install --frozen-lockfile --ignore-scripts
EXPOSE 3002
CMD ["bun", "run", "dev", "--host", "0.0.0.0"]
