/**
 * Hostinger Production Entry Point for Next.js Application
 * Fully compatible with Phusion Passenger, Unix Domain Sockets, and TCP Ports.
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
const next = require('next');

// Ensure production environment
process.env.NODE_ENV = 'production';
process.chdir(__dirname);

// ─── 1. Global Crash Protection & Diagnostics ─────────────────────────────────
process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception at:', new Date().toISOString());
  console.error('Error Name:', err?.name || 'Unknown');
  console.error('Message   :', err?.message || String(err));
  console.error('Stack     :', err?.stack || 'No stack trace available');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[WARN] Unhandled Promise Rejection at:', promise);
  console.error('Reason:', reason?.stack || reason);
});

// ─── 2. Environment Variables Loader ──────────────────────────────────────────
function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const idx = trimmed.indexOf('=');
          const key = trimmed.slice(0, idx).trim();
          let val = trimmed.slice(idx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      });
    } catch (e) {
      console.warn('[Env] Error reading env file:', e.message);
    }
  }
}

loadEnvFile(path.join(__dirname, '.env'));
loadEnvFile(path.join(__dirname, '.env.production'));

process.env.NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.nammaorrufoods.com';
process.env.NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://nammaoorufoods.com';

// ─── 3. Socket vs TCP Port Resolution ─────────────────────────────────────────
const rawPort = process.env.PORT;
let port;
let isSocket = false;

if (rawPort) {
  const parsed = parseInt(rawPort, 10);
  if (isNaN(parsed) || rawPort.startsWith('/') || rawPort.includes('passenger') || rawPort.includes('\\\\.\\pipe\\')) {
    port = rawPort;
    isSocket = true;
  } else {
    port = parsed;
  }
} else {
  port = 3000;
}

const hostname = process.env.HOSTNAME || '0.0.0.0';

console.log('===================================================');
console.log('  Namma Ooru Foods - Hostinger Production Server   ');
console.log('===================================================');
console.log(`[Startup] Node Version  : ${process.version}`);
console.log(`[Startup] NODE_ENV      : ${process.env.NODE_ENV}`);
console.log(`[Startup] Working Dir   : ${process.cwd()}`);
console.log(`[Startup] Script Dir    : ${__dirname}`);
console.log(`[Startup] Raw PORT Env  : ${rawPort || 'undefined (using fallback 3000)'}`);
console.log(`[Startup] Binding Mode  : ${isSocket ? 'Unix Socket / Pipe' : 'TCP Port'}`);
console.log(`[Startup] Address/Port  : ${isSocket ? port : `${hostname}:${port}`}`);
console.log(`[Startup] API URL       : ${process.env.NEXT_PUBLIC_API_URL}`);
console.log('===================================================');

// ─── 4. Bootstrap Next.js App & HTTP Server ───────────────────────────────────
let handle;
let isNextReady = false;

try {
  const NextServer = require('next/dist/server/next-server').default;
  const reqFilesPath = path.join(__dirname, '.next/required-server-files.json');
  const requiredServerFiles = fs.existsSync(reqFilesPath) ? require(reqFilesPath) : { config: {} };

  const nextServer = new NextServer({
    hostname: typeof port === 'number' ? hostname : '0.0.0.0',
    port: typeof port === 'number' ? port : 3000,
    dir: __dirname,
    dev: false,
    customServer: false,
    conf: requiredServerFiles.config,
  });
  handle = nextServer.getRequestHandler();
  isNextReady = true;
  console.log('[Success] NextServer initialized successfully via NextServer engine');
} catch (err) {
  console.warn('[Startup Warning] Direct NextServer initialization failed, trying fallback next():', err.message);
  const app = next({
    dev: false,
    dir: __dirname,
    hostname: typeof port === 'number' ? hostname : undefined,
    port: typeof port === 'number' ? port : undefined,
    conf: fs.existsSync(path.join(__dirname, '.next/required-server-files.json'))
      ? require(path.join(__dirname, '.next/required-server-files.json')).config
      : undefined
  });
  handle = app.getRequestHandler();
}

const server = http.createServer(async (req, res) => {
  // Ultra-fast HTTP Health Check Endpoint
  if (req.url === '/api/health' || req.url === '/health') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0'
    });
    return res.end(JSON.stringify({
      status: 'ok',
      service: 'nammaoorufoods-frontend',
      nodeVersion: process.version,
      uptimeSeconds: Math.floor(process.uptime()),
      bindingMode: isSocket ? 'socket' : 'tcp',
      port: port,
      isNextReady: isNextReady,
      memoryUsageMB: {
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
      }
    }));
  }

  try {
    await handle(req, res);
  } catch (err) {
    console.error('[Error] Request handling error for:', req.url, err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Internal Server Error:\n' + (err.stack || err.message || String(err)));
    }
  }
});

server.on('error', (err) => {
  console.error('[FATAL] HTTP Server Listener Error:', err);
  console.error('Error code:', err.code);
  console.error('Stack trace:', err.stack);
});

// CRITICAL FOR PHUSION PASSENGER & UNIX SOCKETS:
// Do NOT pass `hostname` as 2nd argument when `port` is a socket path string!
if (isSocket) {
  try {
    if (typeof port === 'string' && fs.existsSync(port)) {
      fs.unlinkSync(port);
      console.log(`[Socket] Removed stale socket file at: ${port}`);
    }
  } catch (e) {
    console.warn(`[Socket] Could not remove existing socket file ${port}:`, e.message);
  }

  server.listen(port, () => {
    isNextReady = true;
    console.log(`[Success] Server is active and listening on Unix Socket: ${port}`);
  });
} else {
  server.listen(port, hostname, () => {
    isNextReady = true;
    console.log(`[Success] Server is active and listening on TCP ${hostname}:${port}`);
  });
}

// ─── 5. Prepare Next.js in Background ─────────────────────────────────────────
app.prepare()
  .then(() => {
    isNextReady = true;
    console.log('[Success] Next.js application prepared successfully');
  })
  .catch((err) => {
    console.error('[FATAL] Failed to prepare Next.js application:', err);
  });

// ─── 6. Graceful Termination Handlers ─────────────────────────────────────────
const gracefulShutdown = (signal) => {
  console.log(`[System] Signal ${signal} received. Closing HTTP server...`);
  server.close(() => {
    console.log('[System] HTTP server closed gracefully.');
    process.exit(0);
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
