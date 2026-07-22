/**
 * Hostinger Production Entry Point for Next.js Application
 * Compatible with Phusion Passenger, Unix Domain Sockets, and TCP Ports.
 */

const path = require('path');
const fs = require('fs');

// Ensure production environment
process.env.NODE_ENV = 'production';
process.chdir(__dirname);

// ─── 1. Global Process Safety Handlers ─────────────────────────────────────
process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', err?.stack || err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[WARN] Unhandled Promise Rejection at:', promise, 'reason:', reason);
});

// ─── 2. Environment Variables Initialization ──────────────────────────────
const envPath = path.join(__dirname, '.env');
const envProdPath = path.join(__dirname, '.env.production');

if (fs.existsSync(envPath)) {
  try {
    require('dotenv').config({ path: envPath });
  } catch (e) {
    console.warn('[Env] Failed to load .env file:', e.message);
  }
} else if (fs.existsSync(envProdPath)) {
  try {
    require('dotenv').config({ path: envProdPath });
  } catch (e) {
    console.warn('[Env] Failed to load .env.production file:', e.message);
  }
}

// Set standard production fallbacks if missing
process.env.NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.nammaorrufoods.com';
process.env.NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://nammaorrufoods.com';

// ─── 3. Socket vs Port Binding Resolution ──────────────────────────────────
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
console.log('  Namma Ooru Foods - Hostinger Next.js Server     ');
console.log('===================================================');
console.log(`[Startup] Node Version : ${process.version}`);
console.log(`[Startup] NODE_ENV     : ${process.env.NODE_ENV}`);
console.log(`[Startup] Binding Type : ${isSocket ? 'Unix Domain Socket' : 'TCP Port'}`);
console.log(`[Startup] Address      : ${isSocket ? port : `${hostname}:${port}`}`);
console.log(`[Startup] API URL      : ${process.env.NEXT_PUBLIC_API_URL}`);
console.log('===================================================');

// ─── 4. Bootstrap Next.js Standalone Server ────────────────────────────────
let startServer;
try {
  startServer = require('next/dist/server/lib/start-server').startServer;
} catch (e) {
  console.error('[FATAL] Failed to load Next.js startServer module:', e);
  process.exit(1);
}

let nextConfig;
try {
  const requiredFiles = require('./.next/required-server-files.json');
  nextConfig = requiredFiles.config;
} catch (e) {
  console.warn('[Startup] could not read required-server-files.json, using fallback config');
  nextConfig = {
    output: 'standalone',
    trailingSlash: true,
    images: { unoptimized: true }
  };
}

startServer({
  dir: __dirname,
  isDev: false,
  config: nextConfig,
  hostname,
  port,
  allowRetry: false,
})
  .then(() => {
    console.log(`[Success] Server is running and listening on ${isSocket ? port : `${hostname}:${port}`}`);
  })
  .catch((err) => {
    console.error('[FATAL] Server launch failed:', err);
    process.exit(1);
  });

// ─── 5. Graceful Shutdown Handlers ──────────────────────────────────────────
const gracefulShutdown = (signal) => {
  console.log(`[System] Received ${signal}. Shutting down gracefully...`);
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
