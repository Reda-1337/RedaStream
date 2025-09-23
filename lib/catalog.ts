import { tmdbFetch } from './tmdb'

export type CatalogGenre = { id: number; name: string }

export type CatalogFilters = {
  movieGenres: CatalogGenre[]
  tvGenres: CatalogGenre[]
  years: string[]
}

const FALLBACK_FILTERS: CatalogFilters = {
  movieGenres: [],
  tvGenres: [],
  years: []
}

export const COMMON_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ar', label: 'Arabic' },
  { value: 'it', label: 'Italian' }
] as const

export function getLanguageLabel(code: string | null | undefined) {
  if (!code) return ''
  const normalized = code.toLowerCase()
  const match = COMMON_LANGUAGES.find((language) => language.value === normalized)
  return match ? match.label : normalized.toUpperCase()
}

export async function fetchCatalogFilters(): Promise<CatalogFilters> {
  try {
    const [movieGenresResponse, tvGenresResponse] = await Promise.all([
      tmdbFetch<{ genres?: CatalogGenre[] }>('/genre/movie/list'),
      tmdbFetch<{ genres?: CatalogGenre[] }>('/genre/tv/list')
    ])

    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 80 }, (_, index) => String(currentYear - index))

    return {
      movieGenres: Array.isArray(movieGenresResponse.genres) ? movieGenresResponse.genres : [],
      tvGenres: Array.isArray(tvGenresResponse.genres) ? tvGenresResponse.genres : [],
      years
    }
  } catch (error) {
    console.error('Error fetching catalog filters:', error)
    return FALLBACK_FILTERS
  }
}
