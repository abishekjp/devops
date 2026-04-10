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
const API_KEY = process.env.API_KEY || "demo-authorization-value";

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  requestCount++;
  next();
});

// ============================================================
// SHARED STYLES — dark cyber/terminal aesthetic
// ============================================================
const sharedStyles = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;600;700&family=Syne:wght@400;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #080c10;
    --surface:   #0d1117;
    --border:    #1a2332;
    --green:     #00ff87;
    --green-dim: #00cc6a;
    --cyan:      #00d4ff;
    --red:       #ff4560;
    --yellow:    #ffd166;
    --text:      #c9d1d9;
    --text-dim:  #6e7f94;
    --glow:      0 0 20px rgba(0,255,135,0.3);
    --glow-cyan: 0 0 20px rgba(0,212,255,0.3);
  }

  html, body { height: 100%; }

  body {
    font-family: 'JetBrains Mono', monospace;
    background-color: var(--bg);
    color: var(--text);
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Animated grid background */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(0,255,135,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,135,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 0;
  }

  /* Scan line effect */
  body::after {
    content: '';
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--green), transparent);
    animation: scanline 4s linear infinite;
    z-index: 9999;
    pointer-events: none;
  }

  @keyframes scanline {
    0%   { top: 0; opacity: 1; }
    90%  { opacity: 0.5; }
    100% { top: 100vh; opacity: 0; }
  }

  .page-wrapper {
    position: relative;
    z-index: 1;
    max-width: 900px;
    margin: 0 auto;
    padding: 40px 24px 60px;
  }

  /* ── Header ── */
  .site-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 48px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border);
  }

  .logo {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.4rem;
    letter-spacing: 0.05em;
    color: var(--green);
    text-shadow: var(--glow);
  }

  .logo span { color: var(--text-dim); font-weight: 400; }

  .live-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.75rem;
    color: var(--green);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .live-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--green);
    box-shadow: var(--glow);
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.8); }
  }

  /* ── Hero ── */
  .hero { margin-bottom: 48px; }

  .hero-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 16px;
    background: linear-gradient(135deg, #ffffff 0%, var(--green) 60%, var(--cyan) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: fadeUp 0.6s ease both;
  }

  .hero-sub {
    font-size: 0.9rem;
    color: var(--text-dim);
    line-height: 1.7;
    max-width: 580px;
    animation: fadeUp 0.6s 0.1s ease both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Stats Bar ── */
  .stats-bar {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: var(--border);
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 40px;
    animation: fadeUp 0.6s 0.2s ease both;
  }

  .stat {
    background: var(--surface);
    padding: 18px 20px;
    text-align: center;
  }

  .stat-value {
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--green);
    text-shadow: var(--glow);
    font-family: 'Syne', sans-serif;
  }

  .stat-label {
    font-size: 0.7rem;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: 4px;
  }

  /* ── Endpoint Cards ── */
  .section-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--text-dim);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    animation: fadeUp 0.6s 0.3s ease both;
  }

  .section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 40px;
    animation: fadeUp 0.6s 0.35s ease both;
  }

  @media (max-width: 560px) { .cards { grid-template-columns: 1fr; } }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 20px;
    text-decoration: none;
    color: inherit;
    display: block;
    transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
    position: relative;
    overflow: hidden;
  }

  .card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--green), var(--cyan));
    opacity: 0;
    transition: opacity 0.2s;
  }

  .card:hover {
    border-color: var(--green);
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(0,255,135,0.15);
  }

  .card:hover::before { opacity: 1; }

  .card-method {
    display: inline-block;
    background: rgba(0,255,135,0.1);
    color: var(--green);
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    padding: 3px 8px;
    border-radius: 4px;
    margin-bottom: 12px;
    border: 1px solid rgba(0,255,135,0.2);
  }

  .card-path {
    font-size: 1rem;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 6px;
  }

  .card-desc {
    font-size: 0.78rem;
    color: var(--text-dim);
    line-height: 1.5;
  }

  .card-arrow {
    position: absolute;
    bottom: 16px; right: 16px;
    color: var(--text-dim);
    font-size: 1.1rem;
    transition: color 0.2s, transform 0.2s;
  }

  .card:hover .card-arrow { color: var(--green); transform: translate(3px, -3px); }

  /* ── API Key Box ── */
  .api-box {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 24px;
    margin-bottom: 40px;
    animation: fadeUp 0.6s 0.4s ease both;
  }

  .api-box-title {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--yellow);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .key-row {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 12px 16px;
    margin-bottom: 12px;
  }

  .key-label {
    font-size: 0.72rem;
    color: var(--text-dim);
    min-width: 80px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .key-value {
    font-size: 0.85rem;
    color: var(--cyan);
    flex: 1;
    word-break: break-all;
  }

  .copy-btn {
    background: rgba(0,212,255,0.1);
    border: 1px solid rgba(0,212,255,0.2);
    color: var(--cyan);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    padding: 5px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .copy-btn:hover { background: rgba(0,212,255,0.2); }
  .copy-btn.copied { color: var(--green); border-color: rgba(0,255,135,0.3); }

  .test-links { display: flex; gap: 10px; flex-wrap: wrap; }

  .test-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(0,255,135,0.08);
    border: 1px solid rgba(0,255,135,0.2);
    color: var(--green);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.78rem;
    padding: 8px 16px;
    border-radius: 6px;
    text-decoration: none;
    transition: all 0.2s;
  }

  .test-link:hover { background: rgba(0,255,135,0.15); box-shadow: var(--glow); }

  /* ── JSON / Data Box ── */
  .data-block {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 20px;
    font-size: 0.85rem;
    color: var(--green);
    white-space: pre-wrap;
    word-break: break-word;
    line-height: 1.7;
    overflow-x: auto;
    margin-bottom: 20px;
  }

  /* ── Breadcrumb ── */
  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.75rem;
    color: var(--text-dim);
    margin-bottom: 32px;
    animation: fadeUp 0.4s ease both;
  }

  .breadcrumb a { color: var(--green); text-decoration: none; }
  .breadcrumb a:hover { text-decoration: underline; }

  /* ── Status Chip ── */
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 6px 14px;
    border-radius: 20px;
    margin-bottom: 24px;
  }

  .chip.success { background: rgba(0,255,135,0.1); color: var(--green); border: 1px solid rgba(0,255,135,0.25); }
  .chip.error   { background: rgba(255,69,96,0.1);  color: var(--red);   border: 1px solid rgba(255,69,96,0.25); }
  .chip.info    { background: rgba(0,212,255,0.1);  color: var(--cyan);  border: 1px solid rgba(0,212,255,0.25); }

  /* ── Page Title ── */
  .page-title {
    font-family: 'Syne', sans-serif;
    font-size: 2rem;
    font-weight: 800;
    color: #fff;
    margin-bottom: 8px;
    animation: fadeUp 0.5s ease both;
  }

  .page-sub {
    font-size: 0.83rem;
    color: var(--text-dim);
    margin-bottom: 28px;
    animation: fadeUp 0.5s 0.1s ease both;
    line-height: 1.6;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text-dim);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.78rem;
    padding: 8px 16px;
    border-radius: 6px;
    text-decoration: none;
    transition: all 0.2s;
    margin-top: 8px;
  }

  .back-link:hover { border-color: var(--green); color: var(--green); }

  /* ── Footer ── */
  .site-footer {
    text-align: center;
    font-size: 0.72rem;
    color: var(--text-dim);
    margin-top: 60px;
    padding-top: 20px;
    border-top: 1px solid var(--border);
    letter-spacing: 0.05em;
    animation: fadeUp 0.6s 0.5s ease both;
  }

  .site-footer span { color: var(--green); }
`;

// ============================================================
// HOME PAGE
// ============================================================
const renderHome = (uptime, reqCount) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevSecOps Pipeline — Dashboard</title>
  <style>${sharedStyles}</style>
</head>
<body>
  <div class="page-wrapper">

    <header class="site-header">
      <div class="logo">DEV<span>SEC</span>OPS</div>
      <div class="live-badge">
        <div class="live-dot"></div>
        Pipeline Active
      </div>
    </header>

    <section class="hero">
      <h1 class="hero-title">AI-Driven<br>Security Pipeline</h1>
      <p class="hero-sub">
        8-phase DevSecOps workflow — SonarCloud · Docker · Trivy · Kubernetes ·
        Ansible · OpenRouter AI · Zero-touch auto-remediation.
      </p>
    </section>

    <div class="stats-bar">
      <div class="stat">
        <div class="stat-value" id="uptime-val">${uptime}</div>
        <div class="stat-label">Uptime (s)</div>
      </div>
      <div class="stat">
        <div class="stat-value">${reqCount}</div>
        <div class="stat-label">Requests</div>
      </div>
      <div class="stat">
        <div class="stat-value">7</div>
        <div class="stat-label">Pipeline Jobs</div>
      </div>
    </div>

    <div class="section-label">API Endpoints</div>

    <div class="cards">
      <a href="/health" class="card">
        <div class="card-method">GET</div>
        <div class="card-path">/health</div>
        <div class="card-desc">Kubernetes liveness &amp; readiness probe endpoint.</div>
        <div class="card-arrow">↗</div>
      </a>
      <a href="/api/status" class="card">
        <div class="card-method">GET</div>
        <div class="card-path">/api/status</div>
        <div class="card-desc">API operational status and environment info.</div>
        <div class="card-arrow">↗</div>
      </a>
      <a href="/api/data?key=demo-authorization-value" class="card">
        <div class="card-method">GET · AUTH</div>
        <div class="card-path">/api/data</div>
        <div class="card-desc">Protected data endpoint. Requires Bearer token or <code>?key=</code>.</div>
        <div class="card-arrow">↗</div>
      </a>
      <a href="/api/data" class="card">
        <div class="card-method">GET · 401</div>
        <div class="card-path">/api/data (no key)</div>
        <div class="card-desc">Test the 401 Unauthorized response without a key.</div>
        <div class="card-arrow">↗</div>
      </a>
    </div>

    <div class="section-label">Quick Test — API Authentication</div>

    <div class="api-box">
      <div class="api-box-title">⚡ Demo API Key</div>

      <div class="key-row">
        <span class="key-label">API KEY</span>
        <span class="key-value" id="key-display">demo-authorization-value</span>
        <button class="copy-btn" onclick="copyKey()">Copy</button>
      </div>

      <div class="key-row">
        <span class="key-label">HEADER</span>
        <span class="key-value">Authorization: Bearer demo-authorization-value</span>
        <button class="copy-btn" onclick="copyHeader()">Copy</button>
      </div>

      <br>
      <div class="test-links">
        <a href="/api/data?key=demo-authorization-value" class="test-link">✅ Test with valid key</a>
        <a href="/api/data?key=wrong-key" class="test-link" style="color:var(--red);border-color:rgba(255,69,96,0.2);background:rgba(255,69,96,0.06);">❌ Test with wrong key</a>
        <a href="/api/data" class="test-link" style="color:var(--yellow);border-color:rgba(255,209,102,0.2);background:rgba(255,209,102,0.06);">⚠ Test with no key</a>
      </div>
    </div>

    <footer class="site-footer">
      <span>DevSecOps</span> &nbsp;·&nbsp; Node.js ${process.version} &nbsp;·&nbsp; ${NODE_ENV}
    </footer>
  </div>

  <script>
    function copyKey() {
      navigator.clipboard.writeText('demo-authorization-value');
      const btn = document.querySelector('.copy-btn');
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1500);
    }
    function copyHeader() {
      navigator.clipboard.writeText('Authorization: Bearer demo-authorization-value');
      const btns = document.querySelectorAll('.copy-btn');
      btns[1].textContent = 'Copied!';
      btns[1].classList.add('copied');
      setTimeout(() => { btns[1].textContent = 'Copy'; btns[1].classList.remove('copied'); }, 1500);
    }
    // Live uptime counter
    let base = ${Math.floor(process.uptime())};
    setInterval(() => {
      base++;
      const el = document.getElementById('uptime-val');
      if (el) el.textContent = base;
    }, 1000);
  </script>
</body>
</html>`;

// ============================================================
// HEALTH PAGE
// ============================================================
const renderHealth = (data) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>System Health — DevSecOps</title>
  <style>${sharedStyles}</style>
</head>
<body>
  <div class="page-wrapper">
    <header class="site-header">
      <div class="logo">DEV<span>SEC</span>OPS</div>
      <div class="live-badge"><div class="live-dot"></div>Live</div>
    </header>

    <div class="breadcrumb">
      <a href="/">Home</a> <span>›</span> /health
    </div>

    <div class="chip success">✓ All Systems Operational</div>
    <h1 class="page-title">System Health</h1>
    <p class="page-sub">Kubernetes liveness &amp; readiness probe endpoint. Returns 200 OK when healthy.</p>

    <div class="data-block">${JSON.stringify(data, null, 2)}</div>

    <a href="/" class="back-link">← Back to Dashboard</a>

    <footer class="site-footer"><span>DevSecOps</span></footer>
  </div>
</body>
</html>`;

// ============================================================
// API STATUS PAGE
// ============================================================
const renderStatus = (data) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Status — DevSecOps</title>
  <style>${sharedStyles}</style>
</head>
<body>
  <div class="page-wrapper">
    <header class="site-header">
      <div class="logo">DEV<span>SEC</span>OPS</div>
      <div class="live-badge"><div class="live-dot"></div>Live</div>
    </header>

    <div class="breadcrumb">
      <a href="/">Home</a> <span>›</span> /api/status
    </div>

    <div class="chip info">● API Operational</div>
    <h1 class="page-title">API Status</h1>
    <p class="page-sub">Backend API services are running. Environment: <strong style="color:var(--cyan)">${NODE_ENV}</strong></p>

    <div class="data-block">${JSON.stringify(data, null, 2)}</div>

    <a href="/" class="back-link">← Back to Dashboard</a>

    <footer class="site-footer"><span>DevSecOps</span></footer>
  </div>
</body>
</html>`;

// ============================================================
// API DATA — SUCCESS PAGE
// ============================================================
const renderDataSuccess = (data) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Secure Data — DevSecOps</title>
  <style>${sharedStyles}</style>
</head>
<body>
  <div class="page-wrapper">
    <header class="site-header">
      <div class="logo">DEV<span>SEC</span>OPS</div>
      <div class="live-badge"><div class="live-dot"></div>Authenticated</div>
    </header>

    <div class="breadcrumb">
      <a href="/">Home</a> <span>›</span> /api/data
    </div>

    <div class="chip success">🔓 Access Granted</div>
    <h1 class="page-title">Secure Data Payload</h1>
    <p class="page-sub">Authentication successful. API key verified. Returning protected resource data.</p>

    <div class="data-block">${JSON.stringify(data, null, 2)}</div>

    <div style="margin-bottom:16px">
      <div class="section-label">Test Other Keys</div>
      <div class="test-links">
        <a href="/api/data?key=wrong-key" class="test-link" style="color:var(--red);border-color:rgba(255,69,96,0.2);background:rgba(255,69,96,0.06);">❌ Test wrong key</a>
        <a href="/api/data" class="test-link" style="color:var(--yellow);border-color:rgba(255,209,102,0.2);background:rgba(255,209,102,0.06);">⚠ Test no key</a>
      </div>
    </div>

    <a href="/" class="back-link">← Back to Dashboard</a>

    <footer class="site-footer"><span>DevSecOps</span></footer>
  </div>
</body>
</html>`;

// ============================================================
// API DATA — ERROR PAGE
// ============================================================
const renderDataError = (apiKey) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>401 Unauthorized — DevSecOps</title>
  <style>${sharedStyles}</style>
</head>
<body>
  <div class="page-wrapper">
    <header class="site-header">
      <div class="logo">DEV<span>SEC</span>OPS</div>
      <div class="live-badge" style="color:var(--red)"><div class="live-dot" style="background:var(--red);box-shadow:0 0 12px rgba(255,69,96,0.5)"></div>Blocked</div>
    </header>

    <div class="breadcrumb">
      <a href="/">Home</a> <span>›</span> /api/data
    </div>

    <div class="chip error">✕ 401 Unauthorized</div>
    <h1 class="page-title" style="color:var(--red)">Access Denied</h1>
    <p class="page-sub">This endpoint requires a valid API key. Provide it via <code style="color:var(--cyan)">Authorization: Bearer &lt;key&gt;</code> header or <code style="color:var(--cyan)">?key=</code> query parameter.</p>

    <div class="data-block" style="color:var(--red)">{ "error": "Unauthorized — invalid or missing API key" }</div>

    <div class="api-box" style="margin-bottom:24px">
      <div class="api-box-title" style="color:var(--green)">🔑 Use the Demo Key to Authenticate</div>
      <div class="key-row">
        <span class="key-label">API KEY</span>
        <span class="key-value">${apiKey}</span>
        <button class="copy-btn" onclick="navigator.clipboard.writeText('${apiKey}');this.textContent='Copied!';setTimeout(()=>this.textContent='Copy',1500)">Copy</button>
      </div>
      <br>
      <div class="test-links">
        <a href="/api/data?key=${apiKey}" class="test-link">✅ Retry with valid key</a>
      </div>
    </div>

    <a href="/" class="back-link">← Back to Dashboard</a>

    <footer class="site-footer"><span>DevSecOps</span></footer>
  </div>
</body>
</html>`;

// ============================================================
// Routes
// ============================================================

app.get('/', (req, res) => {
  const jsonResponse = {
    application: 'DevSecOps',
    version: '1.0.0',
    status: 'running',
    message: 'Welcome to the DevSecOps Pipeline',
    endpoints: { health: '/health', api_status: '/api/status', api_data: '/api/data' }
  };

  if (req.accepts('html') && req.headers.accept && req.headers.accept.includes('html')) {
    res.send(renderHome(Math.floor(process.uptime()), requestCount));
  } else {
    res.json(jsonResponse);
  }
});

app.get('/health', (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  };

  if (req.accepts('html') && req.headers.accept && req.headers.accept.includes('html')) {
    res.send(renderHealth(healthData));
  } else {
    res.status(200).json(healthData);
  }
});

app.get('/api/status', (req, res) => {
  const statusData = {
    api: 'operational',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    authenticated: false
  };

  if (req.accepts('html') && req.headers.accept && req.headers.accept.includes('html')) {
    res.send(renderStatus(statusData));
  } else {
    res.json(statusData);
  }
});

app.get('/api/data', (req, res) => {
  const authHeader = req.headers['authorization'];
  const testKey    = req.query.key;

  if (authHeader === `Bearer ${API_KEY}` || testKey === API_KEY) {
    const secureData = [
      { id: 1, name: 'Secure Deployment',      status: 'active' },
      { id: 2, name: 'Pipeline Monitoring',     status: 'active' },
      { id: 3, name: 'Vulnerability Scanning',  status: 'active' }
    ];

    if (req.accepts('html') && req.headers.accept && req.headers.accept.includes('html')) {
      res.send(renderDataSuccess({ data: secureData }));
    } else {
      res.json({ data: secureData });
    }
  } else {
    if (req.accepts('html') && req.headers.accept && req.headers.accept.includes('html')) {
      res.status(401).send(renderDataError(API_KEY));
    } else {
      res.status(401).json({ error: 'Unauthorized — invalid or missing API key' });
    }
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

/* istanbul ignore next */
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

/* istanbul ignore next */
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n  🚀 DevSecOps app running → http://localhost:${PORT}`);
    console.log(`  🔑 Demo API key: ${API_KEY}`);
    console.log(`  🔗 Test auth  → http://localhost:${PORT}/api/data?key=${API_KEY}\n`);
  });
}

module.exports = app;
