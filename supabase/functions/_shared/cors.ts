/**
 * CORS Configuration for OpEx Supabase Edge Functions
 * Restricts access to known domains for security
 */

const ALLOWED_ORIGINS = [
  'https://nextjs-notion-starter-kit.transitivebullsh.it', // Production web app
  'https://opex.tbwa-smp.ph', // Production domain (if different)
  'https://docs.opex.tbwa-smp.ph', // Documentation site
  'http://localhost:3000', // Local development - Next.js
  'http://localhost:3001', // Local development - Docusaurus
  'http://localhost:8000', // Local development - Voice agent
  'http://127.0.0.1:3000', // Alternative localhost
  'http://127.0.0.1:3001',
  'http://127.0.0.1:8000',
];

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * Get CORS headers for allowed origin
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && isOriginAllowed(origin)
    ? origin
    : ALLOWED_ORIGINS[0]; // Default to production domain

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

/**
 * Handle CORS preflight request
 */
export function handleCorsPreflightRequest(req: Request): Response {
  const origin = req.headers.get('origin');

  if (!isOriginAllowed(origin)) {
    return new Response('Origin not allowed', {
      status: 403,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  return new Response('ok', {
    headers: getCorsHeaders(origin),
    status: 204
  });
}

/**
 * Create JSON response with CORS headers
 */
export function jsonResponseWithCors(
  data: any,
  origin: string | null,
  status: number = 200
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...getCorsHeaders(origin),
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Create error response with CORS headers
 */
export function errorResponseWithCors(
  message: string,
  origin: string | null,
  status: number = 500
): Response {
  return jsonResponseWithCors(
    { error: message },
    origin,
    status
  );
}
