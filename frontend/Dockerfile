# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

# Install system dependencies for Puppeteer's Chrome
RUN apk add --no-cache \
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
  alsa-lib \
  mesa-gl \
  nodejs \
  yarn

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
ENV PUPPETEER_CACHE_DIR=/app/.puppeteer_cache

# Install pnpm and dependencies
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# Clear any existing Puppeteer cache
RUN rm -rf /root/.cache/puppeteer /opt/render/.cache/puppeteer /app/.puppeteer_cache
# Log Puppeteer Chrome binary path for debugging
RUN find /app/node_modules/puppeteer -name "chrome" -type f || echo "No Puppeteer Chrome binary found"

# Runner stage
FROM node:22-alpine AS runner
WORKDIR /app

# Install system dependencies for Puppeteer's Chrome
RUN apk add --no-cache \
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
  alsa-lib \
  mesa-gl

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
ENV PUPPETEER_CACHE_DIR=/app/.puppeteer_cache

# Copy built assets and dependencies
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/src/app/helper ./src/app/helper
COPY --from=builder /app/temp ./temp

# Clear any existing Puppeteer cache
RUN rm -rf /root/.cache/puppeteer /opt/render/.cache/puppeteer /app/.puppeteer_cache
# Log Puppeteer Chrome binary path for debugging
RUN find /app/node_modules/puppeteer -name "chrome" -type f || echo "No Puppeteer Chrome binary found"

ENV NODE_ENV production
EXPOSE 3000
CMD ["pnpm", "start"]