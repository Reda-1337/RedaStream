'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Channel } from '@/lib/iptv'
import Header from '@/components/Header'
import EnhancedFooter from '@/components/EnhancedFooter'
import Link from 'next/link'
import { Search, Play, X } from 'lucide-react'

const CATEGORIES = ['All', 'News', 'Entertainment', 'Sports', 'Science', 'Documentary', 'Business', 'Music'] as const
const LANGUAGES = ['All', 'ar', 'en', 'fr'] as const

const LANG_LABELS: Record<string, string> = {
  All: 'All Languages',
  ar: 'Arabic',
  en: 'English',
  fr: 'French',
  ko: 'Korean',
}

export default function LiveTVPage() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [activeLanguage, setActiveLanguage] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(48)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await fetch('/api/live/channels', { cache: 'no-store' })
        const data = await res.json()
        if (!alive) return
        setChannels(Array.isArray(data?.channels) ? data.channels : [])
      } catch {
        if (alive) setChannels([])
      }
    })()

    return () => {
      alive = false
    }
  }, [])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    return channels.filter((ch) => {
      const catMatch = activeCategory === 'All' || ch.category === activeCategory
      const langMatch = activeLanguage === 'All' || ch.language === activeLanguage
      const searchMatch = !q || ch.name.toLowerCase().includes(q)
      return catMatch && langMatch && searchMatch
    })
  }, [channels, activeCategory, activeLanguage, searchQuery])

  useEffect(() => {
    setVisibleCount(48)
  }, [activeCategory, activeLanguage, searchQuery])

  const visibleChannels = filtered.slice(0, visibleCount)
  const hasFilters = activeCategory !== 'All' || activeLanguage !== 'All' || searchQuery.trim().length > 0

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 selection:bg-cyan-500/30">
      <Header />

      <main className="mx-auto max-w-[1600px] px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-8 sm:py-10">
          <h1 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Live <span className="text-cyan-400">TV Channels</span>
          </h1>
          <p className="mt-3 text-center text-sm text-slate-400 sm:text-base">
            Fast channel browsing, cleaner filters, and mobile-friendly playback flow.
          </p>

          <div className="relative mt-6 w-full max-w-2xl">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-2xl border border-slate-800 bg-slate-900/60 py-3.5 pl-11 pr-12 text-slate-200 placeholder-slate-500 shadow-xl backdrop-blur-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-2 my-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="sticky top-20 z-10 -mx-4 mb-8 space-y-4 bg-[#0a0a0a]/85 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              {filtered.length} channels found
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('All')
                  setActiveLanguage('All')
                  setSearchQuery('')
                }}
                className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300 transition hover:border-cyan-400/60 hover:text-white"
              >
                Reset filters
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'scale-105 bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.35)]'
                    : 'border border-slate-800/50 bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex w-full max-w-max gap-2 rounded-xl border border-slate-800/60 bg-slate-900/60 p-1.5">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveLanguage(lang)}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                  activeLanguage === lang ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
                }`}
                title={LANG_LABELS[lang]}
              >
                {lang === 'All' ? 'All' : lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-800/60 bg-slate-900/30 py-24 text-center">
            <Search className="mb-4 h-10 w-10 text-slate-600" />
            <h3 className="text-xl font-bold text-slate-300">No channels found</h3>
            <p className="mt-2 text-slate-500">Try a different query or reset filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleChannels.map((ch, i) => (
                <Link
                  key={ch.id || i}
                  href={`/live/watch?url=${encodeURIComponent(ch.streamUrl)}&name=${encodeURIComponent(ch.name)}`}
                  className="group block"
                >
                  <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-800/50 bg-slate-900 shadow-lg transition-all duration-300 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                    {ch.logo ? (
                      <div className="absolute inset-0 flex items-center justify-center p-8 opacity-30 grayscale transition-opacity group-hover:opacity-20 group-hover:grayscale-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={ch.logo} alt={ch.name} className="max-h-full max-w-full object-contain" loading="lazy" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950" />
                    )}

                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 text-center">
                      <h3 className="line-clamp-2 text-xl font-black tracking-tight text-white drop-shadow-lg transition-transform duration-300 group-hover:scale-105 md:text-2xl">
                        {ch.name}
                      </h3>

                      <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-all duration-300 group-hover:opacity-100">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.6)]">
                          <Play className="ml-0.5 h-5 w-5 fill-current" />
                        </div>
                      </div>
                    </div>

                    <div className="absolute right-3 top-3 z-20">
                      <span className="flex items-center gap-1.5 rounded bg-red-500/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg backdrop-blur-md">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                        Live
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 px-1">
                    <h4 className="truncate text-base font-bold text-slate-200 transition-colors group-hover:text-cyan-400">
                      {ch.name}
                    </h4>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{ch.category}</span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-500">
                        {(ch.language && LANG_LABELS[ch.language]) || (ch.language || 'EN').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {visibleCount < filtered.length && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 48)}
                  className="rounded-full border border-slate-700 bg-slate-800 px-8 py-3 font-semibold text-slate-300 shadow-lg transition-all duration-300 hover:border-cyan-500 hover:bg-cyan-600 hover:text-white"
                >
                  Load More ({filtered.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <EnhancedFooter />
    </div>
  )
}