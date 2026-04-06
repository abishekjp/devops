// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FILE 1: app/app.js
// Phase 1 — Developer Application
// Node.js HTTP server with health checks, Prometheus metrics,
// and structured request logging.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const http = require('http');

// ── Configuration ──────────────────────────────────────────
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const APP_NAME = 'DevSecOps';
const APP_VERSION = '1.0.0';
const startTime = Date.now();

// ── Prometheus Metrics ─────────────────────────────────────
// Simple counters for demonstration — no external dependencies
let requestCount = 0;

// ── Request Logger ─────────────────────────────────────────
// Logs every request with timestamp, method, path, and status
function logRequest(method, path, statusCode) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${method} ${path} ${statusCode}`);
}

// ── Route Handlers ─────────────────────────────────────────

/**
 * GET / — HTML welcome page
 * Shows app name, version, and current environment
 */
function handleRoot(req, res) {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${APP_NAME}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
      color: #e0e0e0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 3rem;
      max-width: 500px;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    h1 { font-size: 2rem; margin-bottom: 1rem; color: #7c4dff; }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 600;
      margin: 0.25rem;
    }
    .version { background: #1b5e20; color: #a5d6a7; }
    .env { background: #e65100; color: #ffcc80; }
    .info { margin-top: 1.5rem; font-size: 0.9rem; color: #aaa; }
    .uptime { margin-top: 1rem; font-size: 0.85rem; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 ${APP_NAME}</h1>
    <p>AI-Driven DevSecOps Pipeline</p>
    <div style="margin-top: 1rem;">
      <span class="badge version">v${APP_VERSION}</span>
      <span class="badge env">${NODE_ENV}</span>
    </div>
    <p class="info">Secure CI/CD • Ansible Hardening • AI Remediation</p>
    <p class="uptime">Uptime: ${uptimeSeconds}s | Requests: ${requestCount}</p>
  </div>
</body>
</html>`;
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
}

/**
 * GET /health — JSON health check endpoint
 * Used by Kubernetes liveness/readiness probes
 */
function handleHealth(req, res) {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const healthData = {
    status: 'ok',
    version: APP_VERSION,
    uptime_seconds: uptimeSeconds
  };
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(healthData));
}

/**
 * GET /metrics — Prometheus-compatible plain text metrics
 * Exposes request_count_total and uptime_seconds gauges
 */
function handleMetrics(req, res) {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const metrics = [
    '# HELP request_count_total Total number of HTTP requests received',
    '# TYPE request_count_total counter',
    `request_count_total ${requestCount}`,
    '',
    '# HELP uptime_seconds Application uptime in seconds',
    '# TYPE uptime_seconds gauge',
    `uptime_seconds ${uptimeSeconds}`
  ].join('\n');
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(metrics);
}

/**
 * 404 handler for unknown routes
 */
function handleNotFound(req, res) {
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found', path: req.url }));
}

// ── HTTP Server ────────────────────────────────────────────
const server = http.createServer((req, res) => {
  // Increment global request counter
  requestCount++;

  // Route dispatcher
  let statusCode = 200;
  switch (req.url) {
    case '/':
      handleRoot(req, res);
      break;
    case '/health':
      handleHealth(req, res);
      break;
    case '/metrics':
      handleMetrics(req, res);
      break;
    default:
      statusCode = 404;
      handleNotFound(req, res);
  }

  // Log every request
  logRequest(req.method, req.url, statusCode);
});

// ── Start Server ───────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  🚀 ${APP_NAME} v${APP_VERSION}`);
  console.log(`  📡 Listening on port ${PORT}`);
  console.log(`  🌍 Environment: ${NODE_ENV}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
});

module.exports = server;
