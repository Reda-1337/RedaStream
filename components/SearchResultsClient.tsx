"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import MediaGrid from '@/components/MediaGrid'
import type { AdvancedSearchResult, SearchType } from '@/lib/search'

type SearchItem = AdvancedSearchResult['results'][number]

type Props = {
  query: string
  type: SearchType
  initialPage: number
  initialResults: SearchItem[]
  initialTotalPages: number
  initialTotalResults: number
  initialSuggestions: string[]
  normalizedQuery: string
  appliedQuery: string
  usedFallback: boolean
  source: AdvancedSearchResult['source']
}

function buildQueryLink(query: string, type: SearchType, page: number | string) {
  const params = new URLSearchParams()
  if (query) params.set('q', query)
  if (type !== 'all') params.set('type', type)
  if (String(page) !== '1') params.set('page', String(page))
  return `/search?${params.toString()}`
}

function dedupeItems(list: SearchItem[]) {
  const map = new Map<string, SearchItem>()
  for (const item of list) {
    if (!item) continue
    const media = item.media_type === 'movie' || item.media_type === 'tv'
      ? item.media_type
      : item.first_air_date
        ? 'tv'
        : 'movie'
    const key = `${media}-${item.id}`
    if (!map.has(key)) {
      map.set(key, { ...item, media_type: media })
    }
  }
  return Array.from(map.values())
}

export default function SearchResultsClient({
  query,
  type,
  initialPage,
  initialResults,
  initialTotalPages,
  initialTotalResults,
  initialSuggestions,
  normalizedQuery,
  appliedQuery,
  usedFallback,
  source
}: Props) {
  const [items, setItems] = useState<SearchItem[]>(() => dedupeItems(initialResults))
  const [page, setPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [totalResults, setTotalResults] = useState(initialTotalResults)
  const [suggestions, setSuggestions] = useState<string[]>(Array.from(new Set(initialSuggestions)))
  const [currentAppliedQuery, setCurrentAppliedQuery] = useState(appliedQuery)
  const [isFallback, setIsFallback] = useState(usedFallback)
  const [lastSeenSource, setLastSeenSource] = useState(source)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setItems(dedupeItems(initialResults))
    setPage(initialPage)
    setTotalPages(initialTotalPages)
    setTotalResults(initialTotalResults)
    setSuggestions(Array.from(new Set(initialSuggestions)))
    setCurrentAppliedQuery(appliedQuery)
    setIsFallback(usedFallback)
    setLastSeenSource(source)
    setError(null)
    setIsLoading(false)
  }, [
    appliedQuery,
    initialPage,
    initialResults,
    initialSuggestions,
    initialTotalPages,
    initialTotalResults,
    normalizedQuery,
    source,
    type,
    usedFallback
  ])

  const hasQuery = normalizedQuery.length >= MIN_QUERY_LENGTH
  const hasResults = items.length > 0

  const hasMore = useMemo(() => {
    if (!hasQuery) return false
    if (page < totalPages) return true
    return items.length < totalResults
  }, [hasQuery, page, totalPages, items.length, totalResults])

  const displayCount = items.length
  const baseQueryLabel = query.trim() || normalizedQuery

  const handleLoadMore = useCallback(async () => {
    if (isLoading || !hasMore) return
    const nextPage = page + 1
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      if (type !== 'all') params.set('type', type)
      params.set('page', String(nextPage))

      const response = await fetch(`/api/search?${params.toString()}`, { cache: 'no-store' })
      if (!response.ok) {
        throw new Error(`Search request failed with ${response.status}`)
      }

      const payload: AdvancedSearchResult = await response.json()
      const nextItems = Array.isArray(payload.results) ? payload.results : []
      const merged = dedupeItems([...items, ...nextItems])

      setItems(merged)
      setPage(nextPage)
      setTotalPages(typeof payload.total_pages === 'number' ? payload.total_pages : totalPages)
      setTotalResults(typeof payload.total_results === 'number' ? payload.total_results : Math.max(totalResults, merged.length))
      setSuggestions((prev) => Array.from(new Set([...prev, ...(payload.suggestions || [])])))
      setCurrentAppliedQuery(payload.appliedQuery || payload.normalizedQuery || currentAppliedQuery)
      setIsFallback((prev) => prev || Boolean(payload.usedFallback))
      setLastSeenSource(payload.source ?? lastSeenSource)
    } catch (exception: any) {
      setError(exception?.message || 'Failed to load more results.')
    } finally {
      setIsLoading(false)
    }
  }, [currentAppliedQuery, hasMore, isLoading, items, lastSeenSource, query, totalPages, totalResults, type, page])

  if (!hasQuery) {
    return (
      <div className="glass-panel mt-10 flex flex-col items-center gap-4 rounded-[28px] border border-slate-800/40 bg-slate-950/70 p-12 text-center text-slate-400">
        <p className="text-lg font-semibold text-white">Start typing to explore RedaStream+</p>
        <p className="max-w-xl text-sm text-slate-400">
          Try searching for blockbuster hits like "Alien", acclaimed series like "Ozark", or explore genres such as sci-fi, drama, and comedy.
        </p>
      </div>
    )
  }

  if (!hasResults) {
    return (
      <div className="glass-panel mt-10 flex flex-col items-center gap-4 rounded-[28px] border border-slate-800/40 bg-slate-950/70 p-12 text-center text-slate-400">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-800/60 bg-slate-900/70 text-cyan-300">
          <SearchIcon />
        </div>
        <p className="text-lg font-semibold text-white">No matches found</p>
        <p className="max-w-xl text-sm text-slate-400">
          We couldn't find results for "{baseQueryLabel}". Try different keywords, check your spelling, or explore the categories on the homepage.
        </p>
        {suggestions.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            Try searching for
            {suggestions.map((suggestion) => (
              <Link
                key={`empty-${suggestion}`}
                href={buildQueryLink(suggestion, type, 1)}
                className="rounded-full border border-slate-700/60 bg-slate-900/70 px-3 py-1 text-cyan-200 transition hover:border-cyan-400/60 hover:text-white"
              >
                "{suggestion}"
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mt-10 space-y-8">
      <section>
        <div className="space-y-1 text-sm text-slate-400">
          <div>
            Showing {displayCount} of {totalResults || displayCount} results for
            <span className="pl-2 text-cyan-200">"{baseQueryLabel}"</span>
          </div>
          {currentAppliedQuery && currentAppliedQuery !== normalizedQuery && (
            <div className="text-xs text-slate-500">
              Displaying closest matches for <span className="text-cyan-200">"{currentAppliedQuery}"</span>
            </div>
          )}
          {isFallback && (
            <div className="text-xs text-slate-500">
              Showing best available matches based on your query spelling.
            </div>
          )}
          {lastSeenSource === 'tmdb-keyword' && (
            <div className="text-xs text-slate-500">
              Related keyword matches have been included for broader coverage.
            </div>
          )}
        </div>

        {suggestions.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span>Did you mean</span>
            {suggestions.map((suggestion) => (
              <Link
                key={suggestion}
                href={buildQueryLink(suggestion, type, 1)}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-cyan-100 transition hover:border-cyan-300/60"
              >
                "{suggestion}"
              </Link>
            ))}
            <span>?</span>
          </div>
        )}

        <div className="mt-6 space-y-6">
          <div>
            <h2 className="mb-5 text-xl font-semibold text-white">Movies & TV Shows</h2>
            <MediaGrid items={items} />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200">
              {error}
            </div>
          )}

          {hasMore && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoading}
                className={`inline-flex items-center gap-2 rounded-full border px-6 py-2 text-xs font-semibold uppercase tracking-[0.35em] transition ${
                  isLoading
                    ? 'border-cyan-400/40 bg-cyan-500/10 text-cyan-200'
                    : 'border-cyan-400/60 bg-cyan-500/10 text-cyan-100 hover:-translate-y-0.5 hover:bg-cyan-500/20'
                }`}
              >
                {isLoading ? 'Loading...' : 'Load more results'}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

const MIN_QUERY_LENGTH = 2

function SearchIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}


