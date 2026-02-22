# ── Stage 1: install dependencies + download Chromium ─────────────────────────
FROM node:20-bookworm-slim AS deps

WORKDIR /app

# Install Chromium system dependencies needed at build time for Puppeteer download
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    wget \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

# Download Chrome into /app/.puppeteer-cache so it can be copied to the runtime stage.
# By default Puppeteer caches to ~/.cache/puppeteer (root's home here), which is
# unreachable from the runtime stage. Setting PUPPETEER_CACHE_DIR keeps it in /app.
ENV PUPPETEER_CACHE_DIR=/app/.puppeteer-cache
RUN npm ci --omit=dev

# ── Stage 2: runtime image ─────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS runtime

# Install Chromium runtime system libraries
# libgcc1 was renamed to libgcc-s1 in Debian Bookworm
# libasound2 (ALSA) is required by Chrome but often omitted from minimal lists
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc-s1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    wget \
    xdg-utils \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create non-root user
RUN groupadd --system pptruser && useradd --system --gid pptruser --create-home pptruser

# Copy node_modules and the Chrome binary cache from the deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.puppeteer-cache ./.puppeteer-cache

# Copy application source
COPY src/ ./src/
COPY package.json ./

# Tell Puppeteer where to find the Chrome binary at runtime
ENV PUPPETEER_CACHE_DIR=/app/.puppeteer-cache

# Owned by non-root user
RUN chown -R pptruser:pptruser /app

USER pptruser

EXPOSE 3000

CMD ["node", "src/server.js"]
