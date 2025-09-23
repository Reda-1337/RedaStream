"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import MediaGrid from './MediaGrid'
import LoadingSkeleton from './LoadingSkeleton'
import { FALLBACK_MOVIES, FALLBACK_TV } from './home/fallbackData'

type CatalogItem = {
  id: number
  title?: string
  name?: string
  poster_path?: string | null
  release_date?: string
  first_air_date?: string
  vote_average?: number
  media_type?: 'movie' | 'tv' | 'person'
}

type Props = {
  initialItems: CatalogItem[]
  initialPage: number
  initialTotalPages: number
  queryKey: string
  queryString: string
  type: 'movie' | 'tv'
}

const LOADING_FALLBACK_COUNT = 6
const FALLBACK_TOTAL_PAGES = 5
const HAS_TMDB_CREDS = Boolean(process.env.NEXT_PUBLIC_TMDB_ENABLED) ? true : Boolean(process.env.TMDB_API_KEY || process.env.TMDB_READ_TOKEN)

const FALLBACK_LIBRARY: Record<'movie' | 'tv', CatalogItem[]> = {
  movie: FALLBACK_MOVIES,
  tv: FALLBACK_TV
}

function buildFallbackPage(type: 'movie' | 'tv', page: number) {
  const base = FALLBACK_LIBRARY[type]
  return base.map((item, index) => ({
    ...item,
    id: (page + 1) * 1000 + index,
    media_type: type
  }))
}

export default function CatalogResults({
  initialItems,
  initialPage,
  initialTotalPages,
  queryKey,
  queryString,
  type
}: Props) {
  const normalizedInitialPage = Number.isFinite(initialPage) && initialPage > 0 ? initialPage : 1
  const normalizedInitialTotal = Number.isFinite(initialTotalPages) && initialTotalPages > 0 ? initialTotalPages : FALLBACK_TOTAL_PAGES

  const [items, setItems] = useState<CatalogItem[]>(initialItems ?? [])
  const [page, setPage] = useState(normalizedInitialPage)
  const [maxPages, setMaxPages] = useState(normalizedInitialTotal)
  const [isLoading, setIsLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setItems(initialItems ?? [])
    setPage(normalizedInitialPage)
    setMaxPages(normalizedInitialTotal)
  }, [initialItems, normalizedInitialPage, normalizedInitialTotal, queryKey])

  const hasMore = useMemo(() => page < maxPages, [page, maxPages])

  const appendItems = useCallback((nextItems: CatalogItem[], nextPage: number, incomingTotalPages: number) => {
    setItems((prev) => [...prev, ...nextItems])
    setPage(nextPage)
    setMaxPages(incomingTotalPages)
  }, [])

  const loadNextPage = useCallback(async () => {
    if (isLoading || !hasMore) return
    setIsLoading(true)
    const nextPage = page + 1

    const handleFallback = () => {
      const fallbackItems = buildFallbackPage(type, nextPage)
      appendItems(fallbackItems, Math.min(nextPage, FALLBACK_TOTAL_PAGES), FALLBACK_TOTAL_PAGES)
    }

    if (!HAS_TMDB_CREDS) {
      handleFallback()
      setIsLoading(false)
      return
    }

    try {
      const params = queryString ? new URLSearchParams(queryString) : new URLSearchParams()
      params.set('type', type)
      params.set('page', String(nextPage))

      const search = params.toString()
      const url = search ? `/api/discover?${search}` : '/api/discover'

      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        headers: { Accept: 'application/json' }
      })

      if (!response.ok) {
        console.warn(`[CatalogResults:${type}] remote request failed with ${response.status}`)
        handleFallback()
        return
      }

      const data = await response.json()
      const nextItems = Array.isArray(data.results) ? data.results : []
      const remotePage = Number.isFinite(Number(data.page)) ? Number(data.page) : nextPage
      const remoteTotalPages = Number.isFinite(Number(data.total_pages)) && Number(data.total_pages) > 0
        ? Number(data.total_pages)
        : FALLBACK_TOTAL_PAGES

      if (nextItems.length === 0) {
        handleFallback()
        return
      }

      appendItems(nextItems, remotePage, remoteTotalPages)
    } catch (err) {
      console.error(`[CatalogResults:${type}]`, err)
      handleFallback()
    } finally {
      setIsLoading(false)
    }
  }, [appendItems, hasMore, isLoading, page, queryString, type])

  useEffect(() => {
    if (!hasMore) return
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadNextPage()
        }
      },
      { rootMargin: '320px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loadNextPage])

  const manualLoadLabel = useMemo(() => {
    if (isLoading) return 'Loading more...'
    if (!hasMore) return 'You have reached the end'
    return 'Load more results'
  }, [hasMore, isLoading])

  return (
    <div className="space-y-8">
      <MediaGrid items={items} />

      <div className="flex flex-col items-center gap-4">
        {isLoading && (
          <div className="w-full">
            <LoadingSkeleton type="grid" count={LOADING_FALLBACK_COUNT} />
          </div>
        )}

        <button
          type="button"
          onClick={loadNextPage}
          disabled={!hasMore || isLoading}
          className={`inline-flex items-center rounded-full border px-6 py-2 text-xs font-semibold uppercase tracking-[0.35em] transition ${
            hasMore
              ? 'border-cyan-400/60 bg-cyan-500/10 text-cyan-100 hover:-translate-y-0.5 hover:bg-cyan-500/20'
              : 'border-slate-900/70 bg-slate-950/60 text-slate-500 cursor-not-allowed'
          }`}
        >
          {manualLoadLabel}
        </button>

        <div ref={sentinelRef} className="h-px w-full" aria-hidden />
      </div>
    </div>
  )
}
