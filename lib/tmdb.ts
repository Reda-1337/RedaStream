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

// ── Discover helpers ────────────────────────────────────────────────

type DiscoverResult = { results: any[]; page: number; total_pages: number; total_results: number }

/** Popular K-Dramas (Korean-origin dramas) */
export async function getKDramas(page = 1): Promise<DiscoverResult> {
  return tmdbFetch<DiscoverResult>('/discover/tv', {
    with_origin_country: 'KR',
    with_genres: '18',
    sort_by: 'popularity.desc',
    page,
  })
}

/** Popular Anime (Japanese-origin animation) */
export async function getAnime(page = 1): Promise<DiscoverResult> {
  return tmdbFetch<DiscoverResult>('/discover/tv', {
    with_origin_country: 'JP',
    with_genres: '16',
    sort_by: 'popularity.desc',
    page,
  })
}

/** Currently trending K-Dramas (filtered from weekly trending TV) */
export async function getTrendingKDramas(): Promise<DiscoverResult> {
  const data = await tmdbFetch<DiscoverResult>('/trending/tv/week', { page: '1' })
  const filtered = (data.results || []).filter((show: any) => show.origin_country?.includes('KR'))
  return { ...data, results: filtered }
}

/** Popular movies */
export async function getPopularMovies(page = 1): Promise<DiscoverResult> {
  return tmdbFetch<DiscoverResult>('/movie/popular', { page })
}

/** Popular TV shows */
export async function getPopularTV(page = 1): Promise<DiscoverResult> {
  return tmdbFetch<DiscoverResult>('/tv/popular', { page })
}

/** Top-rated movies */
export async function getTopRatedMovies(page = 1): Promise<DiscoverResult> {
  return tmdbFetch<DiscoverResult>('/movie/top_rated', { page })
}

/** Top-rated TV shows */
export async function getTopRatedTV(page = 1): Promise<DiscoverResult> {
  return tmdbFetch<DiscoverResult>('/tv/top_rated', { page })
}

/** Upcoming movies */
export async function getUpcoming(page = 1): Promise<DiscoverResult> {
  return tmdbFetch<DiscoverResult>('/movie/upcoming', { page })
}

/** Discover movies by streaming provider */
export async function getMoviesByProvider(providerId: number, page = 1): Promise<DiscoverResult> {
  return tmdbFetch<DiscoverResult>('/discover/movie', {
    with_watch_providers: String(providerId),
    watch_region: 'US',
    sort_by: 'popularity.desc',
    page,
  })
}

/** Discover movies by genre */
export async function getMoviesByGenre(genreId: number, page = 1): Promise<DiscoverResult> {
  return tmdbFetch<DiscoverResult>('/discover/movie', {
    with_genres: String(genreId),
    sort_by: 'popularity.desc',
    page,
  })
}

/** Discover TV shows by genre */
export async function getTvByGenre(genreId: number, page = 1): Promise<DiscoverResult> {
  return tmdbFetch<DiscoverResult>('/discover/tv', {
    with_genres: String(genreId),
    sort_by: 'popularity.desc',
    page,
  })
}

/** TMDB genre constants */
export const MOVIE_GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
] as const

/** TMDB streaming provider IDs */
export const STREAMING_PROVIDERS = [
  { id: 8, name: 'Netflix', icon: '🔴' },
  { id: 9, name: 'Amazon Prime', icon: '🔵' },
  { id: 384, name: 'HBO Max', icon: '🟣' },
  { id: 337, name: 'Disney+', icon: '🏰' },
  { id: 350, name: 'Apple TV+', icon: '🍎' },
  { id: 531, name: 'Paramount+', icon: '⭐' },
] as const
