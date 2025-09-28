export type TmdbMediaType = 'movie' | 'tv' | 'all'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

export function hasTmdbCredentials() {
  if (process.env.NEXT_PUBLIC_TMDB_ENABLED) return true
  return Boolean(process.env.TMDB_READ_TOKEN || process.env.TMDB_API_KEY)
}

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Accept': 'application/json' }
  const bearer = process.env.TMDB_READ_TOKEN
  if (bearer) {
    return { ...headers, Authorization: `Bearer ${bearer}` }
  }
  return headers
}

export function buildTmdbUrl(path: string, query: Record<string, string | number | undefined> = {}): string {
  const url = new URL(path.startsWith('http') ? path : `${TMDB_BASE_URL}${path}`)
  const apiKey = process.env.TMDB_API_KEY
  if (!process.env.TMDB_READ_TOKEN && apiKey) {
    url.searchParams.set('api_key', apiKey)
  }
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

export async function tmdbFetch<T>(path: string, query?: Record<string, string | number | undefined>): Promise<T> {
  const hasBearer = Boolean(process.env.TMDB_READ_TOKEN)
  const hasApiKey = Boolean(process.env.TMDB_API_KEY)
  if (!hasBearer && !hasApiKey) {
    throw new Error('TMDB credentials missing: set TMDB_READ_TOKEN or TMDB_API_KEY in .env.local')
  }
  const url = buildTmdbUrl(path, query)
  const res = await fetch(url, {
    headers: getAuthHeaders(),
    // Enable Next.js caching hints; tune per endpoint
    next: { revalidate: Number(process.env.CACHE_TTL_SECONDS || 300) }
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`TMDB request failed ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

export function errorResponse(message: string, status = 500) {
  return Response.json({ error: { message } }, { status })
}
