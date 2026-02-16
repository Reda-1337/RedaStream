'use client'

import { useState, useMemo } from 'react'
import Header from '@/components/Header'
import EnhancedFooter from '@/components/EnhancedFooter'
import { FEATURED_CHANNELS } from '@/lib/iptv'
import Link from 'next/link'

const CATEGORIES = ['All', 'News', 'Entertainment', 'Sports', 'Science', 'Documentary', 'Business', 'Music'] as const
const LANGUAGES = ['All', 'ar', 'en', 'fr'] as const

const LANG_LABELS: Record<string, string> = {
    All: 'All Languages',
    ar: '🇲🇦 Arabic',
    en: '🇺🇸 English',
    fr: '🇫🇷 French',
    ko: '🇰🇷 Korean',
}

export default function LiveTVPage() {
    const [activeCategory, setActiveCategory] = useState<string>('All')
    const [activeLanguage, setActiveLanguage] = useState<string>('All')

    const filtered = useMemo(() => {
        return FEATURED_CHANNELS.filter((ch) => {
            const catMatch = activeCategory === 'All' || ch.category === activeCategory
            const langMatch = activeLanguage === 'All' || ch.language === activeLanguage
            return catMatch && langMatch
        })
    }, [activeCategory, activeLanguage])

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-[#020617]">
            <Header />
            <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3 sm:text-4xl">
                        <span className="inline-block w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                        Live TV
                    </h1>
                    <p className="mt-2 text-slate-400">Free live channels from around the world — {FEATURED_CHANNELS.length} channels available</p>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-1.5 rounded-full transition whitespace-nowrap text-sm font-medium ${activeCategory === cat
                                    ? 'bg-cyan-500 text-slate-950 shadow-[0_4px_15px_rgba(6,182,212,0.35)]'
                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Language Filter */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setActiveLanguage(lang)}
                            className={`px-3 py-1 rounded-full transition whitespace-nowrap text-xs font-medium ${activeLanguage === lang
                                    ? 'bg-rose-500/20 border border-rose-500/40 text-rose-200'
                                    : 'bg-slate-800/60 border border-slate-700/40 text-slate-400 hover:border-slate-600 hover:text-white'
                                }`}
                        >
                            {LANG_LABELS[lang] || lang}
                        </button>
                    ))}
                </div>

                {/* Results count */}
                <p className="text-xs text-slate-500 mb-4">{filtered.length} channel{filtered.length !== 1 ? 's' : ''} found</p>

                {/* Channel Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {filtered.map((ch, i) => (
                        <Link
                            key={i}
                            href={`/live/watch?url=${encodeURIComponent(ch.streamUrl)}&name=${encodeURIComponent(ch.name)}`}
                            className="group flex flex-col items-center gap-4 p-6 rounded-2xl border border-slate-800/60 bg-slate-900/50 hover:bg-slate-800/70 hover:border-cyan-400/30 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-cyan-400/80"
                        >
                            <div className="h-16 w-16 rounded-2xl bg-slate-800/70 flex items-center justify-center overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={ch.logo}
                                    alt={ch.name}
                                    className="h-10 w-auto object-contain"
                                    loading="lazy"
                                />
                            </div>
                            <div className="text-center space-y-2">
                                <span className="text-sm text-white font-semibold group-hover:text-cyan-200 transition-colors line-clamp-1">
                                    {ch.name}
                                </span>
                                <div className="flex items-center justify-center gap-2 flex-wrap">
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/70 text-slate-400">
                                        {ch.category}
                                    </span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-500">
                                        {LANG_LABELS[ch.language] || ch.language}
                                    </span>
                                    <span className="text-xs text-red-400 flex items-center gap-1">
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                        LIVE
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="text-lg text-white/70 font-medium">No channels match your filters</p>
                        <p className="text-sm text-slate-500 mt-1">Try adjusting the category or language filter</p>
                        <button
                            onClick={() => { setActiveCategory('All'); setActiveLanguage('All') }}
                            className="mt-4 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 hover:text-white transition"
                        >
                            Reset filters
                        </button>
                    </div>
                )}
            </main>
            <EnhancedFooter />
        </div>
    )
}
