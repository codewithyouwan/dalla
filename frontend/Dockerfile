# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

# Install system dependencies for Puppeteer
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont \
  libxss1 \
  gcompat \
  nodejs \
  yarn

# Set environment variables for Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install pnpm and dependencies
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# Runner stage
FROM node:22-alpine AS runner
WORKDIR /app

# Install Chromium and dependencies in the runner stage
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont \
  libxss1 \
  gcompat

# Set environment variables for Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Copy built assets and dependencies
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/src/app/helper ./src/app/helper
COPY --from=builder /app/temp ./temp

# Clear Puppeteer cache to avoid conflicts
RUN rm -rf /root/.cache/puppeteer /opt/render/.cache/puppeteer

ENV NODE_ENV production
EXPOSE 3000
CMD ["pnpm", "start"]