# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FILE 5: Dockerfile (SECURE — pipeline passes)
# Phase 3 — Security Scanning
# Multi-stage build: minimal attack surface
# Runs as non-root user with health checks
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# ── Stage 1: Builder ────────────────────────────────────────
# Install production dependencies only
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# ── Stage 2: Runtime ────────────────────────────────────────
# Minimal image with non-root user
FROM node:18-alpine

# Create non-root user and group for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy only production node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application code with correct ownership
COPY --chown=appuser:appgroup . .

# Switch to non-root user — never run as root in production
USER appuser

# Expose application port
EXPOSE 3000

# Health check — Kubernetes probes also check /health
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD wget -qO- http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "app.js"]
