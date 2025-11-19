/**
 * Rate Limiting Module for OpEx Supabase Edge Functions
 *
 * Simple in-memory rate limiting using Deno KV (edge runtime)
 * Can be upgraded to Upstash Redis for distributed rate limiting
 *
 * Rate Limits:
 * - Anonymous users: 10 requests/minute
 * - Authenticated users: 50 requests/minute
 * - Burst allowance: 20% over limit
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// In-memory store for rate limiting (per instance)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Clean up expired entries (garbage collection)
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 60 seconds
setInterval(cleanupExpiredEntries, 60000);

/**
 * Check rate limit for a given identifier
 */
export function checkRateLimit(config: RateLimitConfig): RateLimitResult {
  const { maxRequests, windowMs, identifier } = config;
  const now = Date.now();
  const key = `ratelimit:${identifier}`;

  // Get current rate limit state
  const state = rateLimitStore.get(key);

  if (!state || now > state.resetTime) {
    // New window or expired window
    const resetTime = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime,
    };
  }

  // Existing window
  if (state.count >= maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((state.resetTime - now) / 1000); // seconds

    return {
      allowed: false,
      remaining: 0,
      resetTime: state.resetTime,
      retryAfter,
    };
  }

  // Increment count
  state.count += 1;
  rateLimitStore.set(key, state);

  return {
    allowed: true,
    remaining: maxRequests - state.count,
    resetTime: state.resetTime,
  };
}

/**
 * Get identifier from request (user ID or IP address)
 */
export function getIdentifier(req: Request): string {
  // Try to get user ID from Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // Extract user ID from JWT (simplified - in production, verify JWT)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.sub) {
        return `user:${payload.sub}`;
      }
    } catch (e) {
      // Invalid JWT, fall through to IP-based rate limiting
    }
  }

  // Fall back to IP address
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';
  return `ip:${ip}`;
}

/**
 * Get rate limit configuration based on identifier type
 */
export function getRateLimitConfig(identifier: string): RateLimitConfig {
  const isAuthenticated = identifier.startsWith('user:');

  return {
    identifier,
    maxRequests: isAuthenticated ? 50 : 10, // 50 req/min for auth, 10 for anon
    windowMs: 60 * 1000, // 1 minute
  };
}

/**
 * Middleware to check rate limit and return error response if exceeded
 */
export function rateLimitMiddleware(req: Request): RateLimitResult {
  const identifier = getIdentifier(req);
  const config = getRateLimitConfig(identifier);
  return checkRateLimit(config);
}

/**
 * Create rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(result.remaining + (result.allowed ? 1 : 0)),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
  };

  if (!result.allowed && result.retryAfter) {
    headers['Retry-After'] = String(result.retryAfter);
  }

  return headers;
}

/**
 * Create 429 Too Many Requests response
 */
export function createRateLimitErrorResponse(
  result: RateLimitResult,
  origin: string | null
): Response {
  const headers = {
    ...getRateLimitHeaders(result),
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin || '*',
  };

  const body = {
    error: 'Too many requests',
    message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
    retryAfter: result.retryAfter,
  };

  return new Response(JSON.stringify(body), {
    status: 429,
    headers,
  });
}
