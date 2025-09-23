"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import MediaGrid from './MediaGrid'
import LoadingSkeleton from './LoadingSkeleton'

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

const FALLBACK_LIBRARY: Record<'movie' | 'tv', Array<Omit<CatalogItem, 'id'>>> = {
  movie: [
    {
      title: 'Inception',
      poster_path: '/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg',
      release_date: '2010-07-16',
      vote_average: 8.4,
      media_type: 'movie'
    },
    {
      title: 'Interstellar',
      poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      release_date: '2014-11-07',
      vote_average: 8.3,
      media_type: 'movie'
    },
    {
      title: 'The Dark Knight',
      poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      release_date: '2008-07-16',
      vote_average: 8.5,
      media_type: 'movie'
    },
    {
      title: 'Dune: Part Two',
      poster_path: '/dGu302NaCTP6aRICUyllRWWDt9G.jpg',
      release_date: '2024-03-01',
      vote_average: 8.3,
      media_type: 'movie'
    },
    {
      title: 'The Matrix',
      poster_path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
      release_date: '1999-03-31',
      vote_average: 8.2,
      media_type: 'movie'
    },
    {
      title: 'Blade Runner 2049',
      poster_path: '/aMpyrCizvSdc0UIMblJ1srVgAEF.jpg',
      release_date: '2017-10-04',
      vote_average: 7.6,
      media_type: 'movie'
    }
  ],
  tv: [
    {
      name: 'Stranger Things',
      poster_path: '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
      first_air_date: '2016-07-15',
      vote_average: 8.6,
      media_type: 'tv'
    },
    {
      name: 'The Boys',
      poster_path: '/mY7SeH4HFFxW1hiI6cWuwCRKptN.jpg',
      first_air_date: '2019-07-25',
      vote_average: 8.5,
      media_type: 'tv'
    },
    {
      name: 'House of the Dragon',
      poster_path: '/1X4h40fcB4WWUmIBK0auT4zRBAV.jpg',
      first_air_date: '2022-08-21',
      vote_average: 8.4,
      media_type: 'tv'
    },
    {
      name: 'The Last of Us',
      poster_path: '/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg',
      first_air_date: '2023-01-15',
      vote_average: 8.6,
      media_type: 'tv'
    },
    {
      name: 'Loki',
      poster_path: '/kEl2t3OhXc3Zb9FBh1AuYzRTgZp.jpg',
      first_air_date: '2021-06-09',
      vote_average: 8.1,
      media_type: 'tv'
    },
    {
      name: 'Breaking Bad',
      poster_path: '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
      first_air_date: '2008-01-20',
      vote_average: 8.9,
      media_type: 'tv'
    }
  ]
}

function buildFallbackPage(type: 'movie' | 'tv', page: number) {
  const base = FALLBACK_LIBRARY[type]
  const results = base.map((item, index) => ({
    ...item,
    id: (page + 1) * 1000 + index,
    media_type: item.media_type
  }))

  return {
    results,
    totalPages: FALLBACK_TOTAL_PAGES
  }
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
  const [error, setError] = useState<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setItems(initialItems ?? [])
    setPage(normalizedInitialPage)
    setMaxPages(normalizedInitialTotal)
    setError(null)
  }, [initialItems, normalizedInitialPage, normalizedInitialTotal, queryKey])

  const hasMore = useMemo(() => page < maxPages, [page, maxPages])

  const appendItems = useCallback((nextItems: CatalogItem[], nextPage: number, incomingTotalPages: number, fallback = false) => {
    setItems((prev) => [...prev, ...nextItems])
    setPage(nextPage)
    setMaxPages(incomingTotalPages)
    setError(fallback ? 'Showing demo results due to API limits.' : null)
  }, [])

  const loadNextPage = useCallback(async () => {
    if (isLoading || !hasMore) return
    setIsLoading(true)
    const nextPage = page + 1

    const handleFallback = () => {
      const fallback = buildFallbackPage(type, nextPage)
      appendItems(fallback.results, Math.min(nextPage, fallback.totalPages), fallback.totalPages, true)
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

        {error && (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {error}
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
