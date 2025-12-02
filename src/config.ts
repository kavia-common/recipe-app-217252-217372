const apiBase = import.meta.env.VITE_API_BASE_URL as string | undefined;

/**
 * PUBLIC_INTERFACE
 * Returns the configured API base URL for backend requests.
 * Throws a clear error if not configured when required, to avoid silent failures.
 */
export function getApiBaseUrl(required = false): string | undefined {
  if (!apiBase && required) {
    throw new Error(
      "VITE_API_BASE_URL is not set. Provide it via environment variables (.env)."
    );
  }
  return apiBase;
}
