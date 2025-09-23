"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import MediaCard from './MediaCard'

type ContentItem = {
  id: number
  title?: string
  name?: string
  poster_path?: string | null
  release_date?: string
  first_air_date?: string
  vote_average?: number
  media_type?: 'movie' | 'tv'
}

type Props = {
  title: string
  items: ContentItem[]
  viewAllHref: string
  icon?: string
  subtitle?: string
  sectionId?: string
}

export default function ContentSection({ title, items, viewAllHref, icon, subtitle, sectionId }: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollMetrics = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return
    setCanScrollLeft(container.scrollLeft > 8)
    setCanScrollRight(container.scrollLeft + container.clientWidth < container.scrollWidth - 8)
  }, [])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    updateScrollMetrics()

    const handleScroll = () => updateScrollMetrics()
    const handleResize = () => updateScrollMetrics()

    container.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)

    return () => {
      container.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [updateScrollMetrics])

  if (items.length === 0) return null

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = Math.max(container.clientWidth * 0.8, 320)
    const delta = direction === 'left' ? -scrollAmount : scrollAmount
    container.scrollBy({ left: delta, behavior: 'smooth' })
    window.setTimeout(updateScrollMetrics, 250)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') scroll('left')
    if (event.key === 'ArrowRight') scroll('right')
  }

  return (
    <section id={sectionId ?? undefined} className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300">
              {icon ?? '*'}
            </span>
            <div>
              <h2 className="text-2xl font-semibold text-white">{title}</h2>
              {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
            </div>
          </div>
        </div>

        <Link
          href={viewAllHref as any}
          className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-300 transition hover:border-cyan-400/60 hover:text-white"
        >
          View All
          <span className="text-cyan-400">{'>'}</span>
        </Link>
      </div>

      <div className="relative">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-full border border-slate-700/60 bg-slate-900/80 p-3 text-white shadow-[0_10px_30px_rgba(8,47,73,0.5)] transition hover:-translate-x-1 hover:border-cyan-400/60"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {canScrollRight && (
          <button
            type="button"
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-full border border-slate-700/60 bg-slate-900/80 p-3 text-white shadow-[0_10px_30px_rgba(8,47,73,0.5)] transition hover:translate-x-1 hover:border-cyan-400/60"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto px-2 pb-1 scrollbar-hide"
          tabIndex={0}
          onKeyDown={onKeyDown}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => {
            const displayTitle = item.title || item.name || 'Untitled'
            const mediaType = item.media_type || (item.name ? 'tv' : 'movie')
            const date = item.release_date || item.first_air_date || ''
            const year = date ? date.slice(0, 4) : ''
            const rating = typeof item.vote_average === 'number' ? item.vote_average : 0

            return (
              <div key={`${mediaType}-${item.id}`} className="w-48 flex-shrink-0">
                <MediaCard
                  id={item.id}
                  title={displayTitle}
                  posterPath={item.poster_path || null}
                  year={year}
                  rating={rating}
                  mediaType={mediaType}
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

