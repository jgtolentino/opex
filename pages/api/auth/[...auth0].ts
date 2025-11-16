// pages/api/auth/[...auth0].ts
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Stub auth handler for docs deployment.
 * Auth0 is not wired up for this app; this prevents compile-time
 * errors from @auth0/nextjs-auth0 version changes.
 */
export default function authHandler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  res
    .status(501)
    .json({ error: 'Auth is not configured for this docs deployment.' });
}
