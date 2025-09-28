import Fuse from 'fuse.js'
import type { IFuseOptions } from 'fuse.js'

import { FALLBACK_MOVIES, FALLBACK_TRENDING, FALLBACK_TV } from '@/components/home/fallbackData'
import { tmdbFetch } from './tmdb'

type RawSearchResult = {
  id: number
  title?: string
  name?: string
  original_title?: string
  original_name?: string
  overview?: string
  poster_path?: string | null
  backdrop_path?: string | null
  release_date?: string
  first_air_date?: string
  vote_average?: number
  media_type?: 'movie' | 'tv' | 'person'
  [key: string]: any
}

type TmdbSearchResponse = {
  results?: RawSearchResult[]
  total_results?: number
  total_pages?: number
}

type TmdbKeywordResponse = {
  results?: Array<{ id: number; name: string }>
}

type NormalizedResult = RawSearchResult & {
  media_type: 'movie' | 'tv'
  release_date?: string
  first_air_date?: string
}

export type SearchType = 'all' | 'movie' | 'tv'

export type AdvancedSearchResult<T = NormalizedResult> = {
  results: T[]
  total_results: number
  total_pages: number
  suggestions: string[]
  usedFallback: boolean
  source: 'tmdb' | 'tmdb-expanded' | 'tmdb-fallback' | 'tmdb-keyword' | 'fuse'
  normalizedQuery: string
  appliedQuery: string
}

const MIN_QUERY_LENGTH = 2
const HAS_TMDB_CREDS = Boolean(process.env.TMDB_API_KEY || process.env.TMDB_READ_TOKEN)
const MAX_SUGGESTIONS = 4
const MIN_RESULTS_TARGET = 18
const KEYWORD_LIMIT = 12
const ADDITIONAL_PAGES = ['2', '3'] as const

const fuseOptions: IFuseOptions<RawSearchResult> = {
  includeScore: true,
  threshold: 0.45,
  keys: ['title', 'name', 'original_title', 'original_name', 'overview']
}

const FALLBACK_LIBRARY = {
  movie: FALLBACK_MOVIES,
  tv: FALLBACK_TV,
  all: [...FALLBACK_MOVIES, ...FALLBACK_TV, ...FALLBACK_TRENDING]
} as const satisfies Record<SearchType, RawSearchResult[]>

const fuseCache: Partial<Record<SearchType, Fuse<RawSearchResult>>> = {}

function normalizeQuery(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

function getEffectiveType(type: SearchType) {
  return type === 'all' ? 'multi' : type
}

function toSearchType(type: string): SearchType {
  if (type === 'movie' || type === 'tv') return type
  return 'all'
}

function inferredMediaType(item: RawSearchResult, fallbackType: SearchType): 'movie' | 'tv' {
  if (item.media_type === 'movie' || item.media_type === 'tv') return item.media_type
  if (fallbackType === 'movie' || fallbackType === 'tv') return fallbackType
  return item.first_air_date ? 'tv' : 'movie'
}

function ensureMediaType(item: RawSearchResult, fallbackType: SearchType): NormalizedResult {
  const mediaType = inferredMediaType(item, fallbackType)
  return {
    ...item,
    media_type: mediaType,
    release_date: item.release_date ?? undefined,
    first_air_date: item.first_air_date ?? undefined
  }
}

function resultKey(item: NormalizedResult) {
  return `${item.media_type}-${item.id}`
}

function sanitizeResults(results: RawSearchResult[], type: SearchType) {
  const seen = new Set<string>()
  const allowedTypes: Array<'movie' | 'tv'> = type === 'all' ? ['movie', 'tv'] : [type]

  return results
    .filter((item) => item && item.media_type !== 'person')
    .map((item) => ensureMediaType(item ?? {}, type))
    .filter((item) => allowedTypes.includes(item.media_type))
    .filter((item) => {
      const key = resultKey(item)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

function levenshtein(a: string, b: string) {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => Array(b.length + 1).fill(0))
  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      )
    }
  }
  return matrix[a.length][b.length]
}

function computeSuggestions(query: string, results: NormalizedResult[], extras: string[] = []) {
  if (results.length === 0) return extras.slice(0, MAX_SUGGESTIONS)
  const normalized = query.toLowerCase()
  const candidates = new Set<string>(extras)
  const maxDistance = Math.max(2, Math.floor(normalized.length * 0.4))

  for (const item of results.slice(0, 16)) {
    const title = (item.title || item.name || '').toString()
    if (!title) continue
    const lower = title.toLowerCase()
    const distance = levenshtein(normalized, lower)
    if (distance <= maxDistance) {
      candidates.add(title)
    }
  }

  return Array.from(candidates).slice(0, MAX_SUGGESTIONS)
}

function getFallbackFuse(type: SearchType) {
  if (!fuseCache[type]) {
    fuseCache[type] = new Fuse(FALLBACK_LIBRARY[type], fuseOptions)
  }
  return fuseCache[type]!
}

function mergeResultSets(type: SearchType, ...lists: Array<RawSearchResult[] | undefined>) {
  const merged: RawSearchResult[] = []
  const seen = new Set<string>()

  for (const list of lists) {
    if (!Array.isArray(list)) continue
    for (const raw of list) {
      if (!raw) continue
      const key = resultKey(ensureMediaType(raw, type))
      if (seen.has(key)) continue
      seen.add(key)
      merged.push(raw)
    }
  }

  return merged
}

function rankResults(query: string, type: SearchType, results: NormalizedResult[]) {
  if (!query || results.length <= 1) return results
  const fuse = new Fuse(results, fuseOptions)
  const rankedMatches = fuse.search(query)
  if (rankedMatches.length === 0) return results

  const ranked: NormalizedResult[] = []
  const seen = new Set<string>()

  for (const match of rankedMatches) {
    const item = ensureMediaType(match.item, type)
    const key = resultKey(item)
    if (seen.has(key)) continue
    seen.add(key)
    ranked.push(item)
  }

  for (const item of results) {
    const key = resultKey(item)
    if (seen.has(key)) continue
    seen.add(key)
    ranked.push(item)
  }

  return ranked
}

function fallbackSearch(query: string, type: SearchType): AdvancedSearchResult {
  const fuseType = type === 'all' ? 'all' : type
  const fuse = getFallbackFuse(fuseType)
  const matches = fuse.search(query, { limit: 30 })
  const items = matches.length > 0 ? matches.map((match) => match.item) : FALLBACK_LIBRARY[fuseType]
  const sanitized = sanitizeResults(items, type)
  const ranked = rankResults(query, type, sanitized)

  return {
    results: ranked,
    total_results: ranked.length,
    total_pages: 1,
    suggestions: computeSuggestions(query, ranked),
    usedFallback: true,
    source: 'fuse',
    normalizedQuery: query,
    appliedQuery: query
  }
}

async function searchTmdb(
  query: string,
  type: SearchType,
  page: string,
  language?: string,
  override?: 'multi' | 'movie' | 'tv'
): Promise<TmdbSearchResponse> {
  const target = override ?? getEffectiveType(type)
  const path = target === 'multi' ? '/search/multi' : target === 'movie' ? '/search/movie' : '/search/tv'
  return tmdbFetch<TmdbSearchResponse>(path, {
    query,
    page,
    language,
    include_adult: 'false'
  })
}

async function discoverByKeywords(
  query: string,
  type: SearchType,
  language?: string
): Promise<{ results: RawSearchResult[]; suggestions: string[] }> {
  try {
    const keywordSearch = await tmdbFetch<TmdbKeywordResponse>('/search/keyword', { query })
    const keywords = (keywordSearch.results || []).slice(0, KEYWORD_LIMIT)
    if (keywords.length === 0) return { results: [], suggestions: [] }

    const keywordIds = keywords.map((entry) => entry.id).join(',')
    const extraSuggestions = keywords.map((entry) => entry.name)

    const targets: Array<'movie' | 'tv'> = type === 'all' ? ['movie', 'tv'] : [type]
    const collected: RawSearchResult[] = []

    for (const target of targets) {
      try {
        const discoverPath = target === 'movie' ? '/discover/movie' : '/discover/tv'
        const payload = await tmdbFetch<TmdbSearchResponse>(discoverPath, {
          with_keywords: keywordIds,
          sort_by: 'popularity.desc',
          page: '1',
          language
        })
        if (Array.isArray(payload?.results)) {
          collected.push(...payload.results)
        }
      } catch (error) {
        // ignore individual discover failures
      }
    }

    return { results: collected, suggestions: extraSuggestions }
  } catch (error) {
    return { results: [], suggestions: [] }
  }
}

async function collectAdditionalPages(
  query: string,
  type: SearchType,
  language: string | undefined,
  existing: RawSearchResult[]
) {
  let aggregated = existing

  for (const pageNumber of ADDITIONAL_PAGES) {
    if (aggregated.length >= MIN_RESULTS_TARGET) break
    try {
      const extra = await searchTmdb(query, type, pageNumber, language)
      if (Array.isArray(extra?.results)) {
        aggregated = mergeResultSets(type, aggregated, extra.results)
      }
    } catch (error) {
      // continue even if a page fails
    }
  }

  if (type === 'all' && aggregated.length < MIN_RESULTS_TARGET) {
    for (const pageNumber of ADDITIONAL_PAGES) {
      if (aggregated.length >= MIN_RESULTS_TARGET) break
      try {
        const [movieExtra, tvExtra] = await Promise.allSettled([
          searchTmdb(query, type, pageNumber, language, 'movie'),
          searchTmdb(query, type, pageNumber, language, 'tv')
        ])
        const movieResults = movieExtra.status === 'fulfilled' ? movieExtra.value?.results : []
        const tvResults = tvExtra.status === 'fulfilled' ? tvExtra.value?.results : []
        aggregated = mergeResultSets(type, aggregated, movieResults, tvResults)
      } catch (error) {
        // ignore
      }
    }
  }

  return aggregated
}

function buildResponse(
  query: string,
  appliedQuery: string,
  type: SearchType,
  payload: TmdbSearchResponse,
  fallback: boolean,
  source: AdvancedSearchResult['source'],
  extraSuggestions: string[] = []
): AdvancedSearchResult {
  const rawResults = Array.isArray(payload?.results) ? payload.results : []
  const sanitized = sanitizeResults(rawResults, type)
  const ranked = rankResults(appliedQuery, type, sanitized)
  const totalResults = typeof payload?.total_results === 'number' ? payload.total_results : ranked.length
  const totalPages = typeof payload?.total_pages === 'number' ? payload.total_pages : 1
  const suggestions = computeSuggestions(appliedQuery, ranked, extraSuggestions)

  return {
    results: ranked,
    total_results: totalResults,
    total_pages: totalPages,
    suggestions,
    usedFallback: fallback,
    source,
    normalizedQuery: query,
    appliedQuery
  }
}

function buildAlternateQueries(query: string) {
  const tokens = query.split(' ').filter(Boolean)
  if (tokens.length <= 1) return [] as string[]

  const alternates = new Set<string>()
  for (let i = 0; i < tokens.length; i += 1) {
    const candidate = tokens.filter((_, index) => index !== i).join(' ').trim()
    if (candidate.length >= MIN_QUERY_LENGTH) {
      alternates.add(candidate)
    }
  }

  const longestTokens = [...tokens]
    .filter((token) => token.length >= 4)
    .sort((a, b) => b.length - a.length)

  if (longestTokens[0]) alternates.add(longestTokens[0])
  if (longestTokens[1]) alternates.add(`${longestTokens[0]} ${longestTokens[1]}`.trim())

  return Array.from(alternates).filter((candidate) => candidate !== query).slice(0, 4)
}

export async function advancedSearch(
  query: string,
  typeInput: SearchType | 'multi',
  page = '1',
  language?: string
): Promise<AdvancedSearchResult> {
  const type = toSearchType(typeInput)
  const normalizedQuery = normalizeQuery(query)

  if (normalizedQuery.length < MIN_QUERY_LENGTH) {
    return {
      results: [],
      total_results: 0,
      total_pages: 0,
      suggestions: [],
      usedFallback: true,
      source: 'fuse',
      normalizedQuery,
      appliedQuery: normalizedQuery
    }
  }

  if (!HAS_TMDB_CREDS) {
    return fallbackSearch(normalizedQuery, type)
  }

  try {
    const primary = await searchTmdb(normalizedQuery, type, page, language)
    if (Array.isArray(primary?.results) && primary.results.length > 0) {
      let aggregated = primary.results
      let suggestions: string[] = []
      let source: AdvancedSearchResult['source'] = 'tmdb'

      if (type === 'all') {
        const [movieAlt, tvAlt] = await Promise.allSettled([
          searchTmdb(normalizedQuery, type, page, language, 'movie'),
          searchTmdb(normalizedQuery, type, page, language, 'tv')
        ])
        const movieResults = movieAlt.status === 'fulfilled' ? movieAlt.value?.results : []
        const tvResults = tvAlt.status === 'fulfilled' ? tvAlt.value?.results : []
        aggregated = mergeResultSets(type, aggregated, movieResults, tvResults)
      }

      aggregated = await collectAdditionalPages(normalizedQuery, type, language, aggregated)
      if (aggregated.length > (primary.results?.length ?? 0)) {
        source = 'tmdb-expanded'
      }

      if (aggregated.length < MIN_RESULTS_TARGET) {
        const keywordFallback = await discoverByKeywords(normalizedQuery, type, language)
        if (keywordFallback.results.length > 0) {
          aggregated = mergeResultSets(type, aggregated, keywordFallback.results)
          suggestions = keywordFallback.suggestions
          source = 'tmdb-keyword'
        }
      }

      const adjustedPayload: TmdbSearchResponse = {
        ...primary,
        results: aggregated,
        total_results: Math.max(primary.total_results ?? aggregated.length, aggregated.length),
        total_pages: primary.total_pages
      }

      return buildResponse(
        normalizedQuery,
        normalizedQuery,
        type,
        adjustedPayload,
        false,
        source,
        suggestions
      )
    }
  } catch (error) {
    // ignore TMDB errors and fall back to alternates/fallbacks
  }

  const alternates = buildAlternateQueries(normalizedQuery)
  for (const alternate of alternates) {
    try {
      const fallbackPayload = await searchTmdb(alternate, type, '1', language)
      if (Array.isArray(fallbackPayload?.results) && fallbackPayload.results.length > 0) {
        return buildResponse(normalizedQuery, alternate, type, fallbackPayload, true, 'tmdb-fallback', [alternate])
      }
    } catch (error) {
      // continue to next alternate
    }
  }

  const keywordFallback = await discoverByKeywords(normalizedQuery, type, language)
  if (keywordFallback.results.length > 0) {
    const payload: TmdbSearchResponse = {
      results: keywordFallback.results,
      total_results: keywordFallback.results.length,
      total_pages: 1
    }
    return buildResponse(normalizedQuery, normalizedQuery, type, payload, true, 'tmdb-keyword', keywordFallback.suggestions)
  }

  return fallbackSearch(normalizedQuery, type)
}
