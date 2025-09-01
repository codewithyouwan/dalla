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
  libx11-xcb \
  libxcomposite \
  libxdamage \
  libxrandr \
  libxtst \
  libatk-bridge-2.0 \
  libatk-1.0 \
  at-spi2-atk \
  nodejs \
  yarn

# Set environment variables for Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_CACHE_DIR=/app/.puppeteer_cache

# Verify Chromium installation
RUN chromium-browser --version && which chromium-browser

# Install pnpm and dependencies
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# Clear any existing Puppeteer cache
RUN rm -rf /root/.cache/puppeteer /opt/render/.cache/puppeteer /app/.puppeteer_cache

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
  gcompat \
  libx11-xcb \
  libxcomposite \
  libxdamage \
  libxrandr \
  libxtst \
  libatk-bridge-2.0 \
  libatk-1.0 \
  at-spi2-atk

# Set environment variables for Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_CACHE_DIR=/app/.puppeteer_cache

# Verify Chromium installation
RUN chromium-browser --version && which chromium-browser

# Copy built assets and dependencies
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/src/app/helper ./src/app/helper
COPY --from=builder /app/temp ./temp

# Clear any existing Puppeteer cache
RUN rm -rf /root/.cache/puppeteer /opt/render/.cache/puppeteer /app/.puppeteer_cache

ENV NODE_ENV production
EXPOSE 3000
CMD ["pnpm", "start"]