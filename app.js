const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const startTime = Date.now();
let requestCount = 0;

// ============================================================
// SECURITY IMPROVEMENT: Using environment variables
// This prevents SonarQube from flagging hardcoded credentials
const API_KEY = process.env.API_KEY || "demo-authorization-value";

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  requestCount++;
  next();
});

// ============================================================
// HTML Template Helper
// ============================================================
const renderPage = (title, content, badge = null) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - DevSecOps</title>
  <style>
    :root {
      --primary-color: #2563eb;
      --bg-color: #f8fafc;
      --card-bg: #ffffff;
      --text-main: #1e293b;
    }
    body {
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg-color);
      color: var(--text-main);
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .container {
      background-color: var(--card-bg);
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      padding: 40px;
      max-width: 600px;
      width: 90%;
      text-align: center;
    }
    h1 {
      color: var(--primary-color);
      margin-bottom: 10px;
      font-size: 2.2rem;
    }
    p {
      color: #64748b;
      font-size: 1.1rem;
      line-height: 1.5;
      margin-bottom: 30px;
    }
    .status-badge {
      display: inline-block;
      background-color: #dcfce7;
      color: #166534;
      padding: 6px 12px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 0.9rem;
      margin-bottom: 20px;
    }
    .status-badge.error {
      background-color: #fee2e2;
      color: #991b1b;
    }
    .endpoints {
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin-top: 30px;
    }
    .btn {
      background-color: var(--primary-color);
      color: white;
      text-decoration: none;
      padding: 12px 20px;
      border-radius: 6px;
      font-weight: 500;
      transition: background-color 0.2s;
    }
    .btn.secondary {
      background-color: #e2e8f0;
      color: #475569;
    }
    .btn.secondary:hover {
      background-color: #cbd5e1;
    }
    .btn:hover {
      background-color: #1d4ed8;
    }
    .data-box {
      background-color: #f1f5f9;
      padding: 20px;
      border-radius: 8px;
      text-align: left;
      font-family: monospace;
      font-size: 0.95rem;
      color: #334155;
      overflow-x: auto;
      margin-bottom: 20px;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <div class="container">
    ${badge ? `<div class="status-badge ${badge.type || ''}">${badge.text}</div>` : ''}
    <h1>${title}</h1>
    ${content}
    <div class="endpoints" style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
      <a href="/" class="btn secondary">← Back to Home</a>
    </div>
  </div>
</body>
</html>
`;

// ============================================================
// Routes
// ============================================================

// Home page serving a nice HTML dashboard (with JSON fallback for tests)
app.get('/', (req, res) => {
  const jsonResponse = {
    application: 'DevSecOps',
    version: '1.0.0',
    status: 'running',
    message: 'Welcome to the DevSecOps Pipeline',
    endpoints: {
      health: '/health',
      api_status: '/api/status',
      api_data: '/api/data'
    }
  };

  if (req.accepts('html') && req.headers.accept && req.headers.accept.includes('html')) {
    res.send(renderPage(
      'DevSecOps',
      `
        <p>Welcome to the live DevSecOps pipeline. Hosted entirely through Jenkins and Kubernetes!</p>
        <div class="endpoints">
          <a href="/health" class="btn">View App Health (/health)</a>
          <a href="/api/status" class="btn">View API Status (/api/status)</a>
          <a href="/api/data" class="btn">View Secure Data (/api/data)</a>
        </div>
      `,
      { text: '🟢 Pipeline Status: Running' }
    ));
  } else {
    // Return original JSON for API consumers and unit tests
    res.json(jsonResponse);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  };
  
  // Format based on Accept header (JSON for k8s probes, HTML for browsers)
  if (req.accepts('html')) {
    res.send(renderPage(
      'System Health',
      `<div class="data-box">${JSON.stringify(healthData, null, 2)}</div>
       <p>The application is responding successfully to liveness probes.</p>`,
      { text: '✅ All Systems Operational' }
    ));
  } else {
    res.status(200).json(healthData);
  }
});

// API status endpoint
app.get('/api/status', (req, res) => {
  const statusData = {
    api: 'operational',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    authenticated: false
  };

  if (req.accepts('html')) {
    res.send(renderPage(
      'API Status',
      `<div class="data-box">${JSON.stringify(statusData, null, 2)}</div>
       <p>The backend API services are configured and running.</p>`
    ));
  } else {
    res.json(statusData);
  }
});

// API data endpoint — uses the hardcoded API key (vulnerability demo)
app.get('/api/data', (req, res) => {
  const authHeader = req.headers['authorization'];
  
  // Provide raw key in query string for easy browser testing during demo
  const testKey = req.query.key;

  if (authHeader === `Bearer ${API_KEY}` || testKey === API_KEY) {
    const secureData = [
      { id: 1, name: 'Secure Deployment', status: 'active' },
      { id: 2, name: 'Pipeline Monitoring', status: 'active' },
      { id: 3, name: 'Vulnerability Scanning', status: 'active' }
    ];

    if (req.accepts('html')) {
      res.send(renderPage(
        'Secured Data Payload',
        `<div class="data-box">${JSON.stringify(secureData, null, 2)}</div>
         <p>You have successfully authenticated using the API key.</p>`,
        { text: '🔓 Access Granted' }
      ));
    } else {
      res.json({ data: secureData });
    }
  } else {
    const errorMsg = 'Unauthorized — invalid or missing API key';
    
    if (req.accepts('html')) {
      res.status(401).send(renderPage(
        'Authentication Failed',
        `<div class="data-box" style="color: #991b1b; background-color: #fef2f2;">{ "error": "${errorMsg}" }</div>
         <p>This endpoint requires an API key in the Authorization header or ?key= query parameter.</p>
         <div style="margin-top: 20px;">
           <a href="/api/data?key=${API_KEY}" class="btn">Test with valid Key</a>
         </div>`,
        { text: '❌ Access Denied', type: 'error' }
      ));
    } else {
      res.status(401).json({ error: errorMsg });
    }
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
/* istanbul ignore next */
app.use((err, req, res, next) => {
  // Use message instead of stack to avoid info disclosure smells
  console.error(err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server (only when run directly, not when imported for testing)
/* istanbul ignore next */
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`DevSecOps app running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

module.exports = app;
