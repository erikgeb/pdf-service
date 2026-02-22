# ── Stage 1: install dependencies + download Chromium ─────────────────────────
FROM node:20-bookworm-slim AS deps

WORKDIR /app

# Install Chromium system dependencies needed at build time for Puppeteer download
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    wget \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

# ── Stage 2: runtime image ─────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS runtime

# Install Chromium runtime system libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    fonts-liberation \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
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
    lsb-release \
    wget \
    xdg-utils \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create non-root user
RUN groupadd --system pptruser && useradd --system --gid pptruser --create-home pptruser

# Copy node_modules (includes bundled Chrome for Testing) from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY src/ ./src/
COPY package.json ./

# Owned by non-root user
RUN chown -R pptruser:pptruser /app

USER pptruser

EXPOSE 3000

CMD ["node", "src/server.js"]
