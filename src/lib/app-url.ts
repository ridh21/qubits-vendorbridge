/**
 * Resolve the canonical app URL across all environments.
 *
 * Priority:
 *   1. `APP_URL`  — explicit override (set this to your custom domain in production)
 *   2. `NEXTAUTH_URL` / `AUTH_URL`  — already configured for Auth.js
 *   3. `VERCEL_PROJECT_PRODUCTION_URL` — production-deploy URL on Vercel
 *   4. `VERCEL_URL` — current-deploy URL on Vercel (preview / production fallback)
 *   5. `http://localhost:3000` — local dev fallback
 *
 * Used by emails (reset links, invoice CTAs) and anywhere an absolute URL is needed.
 */
export function getAppUrl(): string {
  const explicit =
    process.env.APP_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.AUTH_URL
  if (explicit) return stripTrailingSlash(explicit)

  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
  if (vercel) return `https://${stripTrailingSlash(vercel)}`

  return "http://localhost:3000"
}

function stripTrailingSlash(s: string) {
  return s.endsWith("/") ? s.slice(0, -1) : s
}
