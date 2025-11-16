// lib/utils/http.ts
// Typed HTTP response parsing utilities

/**
 * Parse JSON response with optional error handling
 * Returns null if parsing fails
 */
export async function parseJsonOrNull<T>(response: Response): Promise<T | null> {
  try {
    const data = (await response.json()) as unknown as T;
    return data;
  } catch {
    return null;
  }
}

/**
 * Parse JSON response strictly
 * Throws if parsing fails
 */
export async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as unknown as T;
  return data;
}
