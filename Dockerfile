FROM docker.io/node:22.3.0-alpine3.20 AS base

# Set environment variable
ARG AWS_REGION
ARG AWS_PROFILE
ENV AWS_REGION=$AWS_REGION
ENV AWS_PROFILE=$AWS_PROFILE

WORKDIR /app
RUN corepack enable
COPY ./package.json ./pnpm-lock.yaml ./
RUN corepack pnpm install --frozen-lockfile
COPY . .
RUN corepack pnpm build

EXPOSE 3000

CMD [ "corepack", "pnpm", "start" ]
