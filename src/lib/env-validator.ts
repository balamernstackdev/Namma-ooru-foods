/**
 * Environment Variable Validator for Production Deployment
 * Validates critical environment variables and provides graceful fallbacks
 * to prevent startup crashes on Hostinger Node.js hosting.
 */

export interface EnvConfig {
  nodeEnv: string;
  port: string | number;
  baseUrl: string;
  apiUrl: string;
  isValid: boolean;
  warnings: string[];
}

export function validateEnv(): EnvConfig {
  const warnings: string[] = [];

  const nodeEnv = process.env.NODE_ENV || 'production';
  const rawPort = process.env.PORT;
  let port: string | number = 3000;

  if (rawPort) {
    const parsed = parseInt(rawPort, 10);
    port = isNaN(parsed) ? rawPort : parsed;
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nammaorrufoods.com';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.nammaorrufoods.com';

  if (!process.env.NEXT_PUBLIC_API_URL) {
    warnings.push('NEXT_PUBLIC_API_URL not set in process.env; defaulting to https://api.nammaorrufoods.com');
  }

  if (!process.env.NEXT_PUBLIC_BASE_URL) {
    warnings.push('NEXT_PUBLIC_BASE_URL not set in process.env; defaulting to https://nammaorrufoods.com');
  }

  if (warnings.length > 0 && typeof window === 'undefined') {
    console.warn('[Env Validator] Startup warnings:', warnings);
  }

  return {
    nodeEnv,
    port,
    baseUrl,
    apiUrl,
    isValid: true,
    warnings,
  };
}

export const envConfig = validateEnv();
