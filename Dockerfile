FROM node:18-bullseye

RUN corepack enable

WORKDIR /app

# Copy entire monorepo
COPY . .

# Install deps exactly as locked
RUN pnpm install --frozen-lockfile

# Build only the web app
RUN pnpm build --filter=web

# Start the web app
WORKDIR /app/apps/web
CMD ["pnpm", "start"]
