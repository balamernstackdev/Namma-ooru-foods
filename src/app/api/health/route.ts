import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/api';

export async function GET() {
  const startTime = Date.now();
  let backendStatus = 'unknown';
  let backendLatencyMs = 0;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const res = await fetch(`${API_URL}/api/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    clearTimeout(timeoutId);
    
    backendLatencyMs = Date.now() - startTime;
    if (res.ok) {
      backendStatus = 'healthy';
    } else {
      backendStatus = `unhealthy (HTTP ${res.status})`;
    }
  } catch (err: any) {
    backendStatus = `unreachable (${err.message || 'Timeout/Network error'})`;
  }

  return NextResponse.json({
    status: 'ok',
    service: 'namma-orru-foods-frontend',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'production',
    port: process.env.PORT || 'dynamic',
    backendApiUrl: API_URL,
    backendStatus,
    backendLatencyMs,
    memoryUsageMB: {
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    }
  }, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'Content-Type': 'application/json'
    }
  });
}
