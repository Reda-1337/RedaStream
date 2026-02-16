'use client'

import { useState, useMemo } from 'react'
import Header from '@/components/Header'
import EnhancedFooter from '@/components/EnhancedFooter'
import { FEATURED_CHANNELS } from '@/lib/iptv'
import Link from 'next/link'
import { Search, Heart, Play } from 'lucide-react'

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
    const [activeCategory, setActiveCategory] = useState<string>('All')
    const [activeLanguage, setActiveLanguage] = useState<string>('All')
    const [searchQuery, setSearchQuery] = useState('')

    const filtered = useMemo(() => {
        return FEATURED_CHANNELS.filter((ch) => {
            const catMatch = activeCategory === 'All' || ch.category === activeCategory
            const langMatch = activeLanguage === 'All' || ch.language === activeLanguage
            const searchMatch = ch.name.toLowerCase().includes(searchQuery.toLowerCase())
            return catMatch && langMatch && searchMatch
        })
    }, [activeCategory, activeLanguage, searchQuery])

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans selection:bg-cyan-500/30">
            <Header />

            <main className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 pb-20 pt-8">
                {/* Search Header */}
                <div className="flex flex-col items-center justify-center py-10 space-y-6">
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight text-center">
                        Live <span className="text-cyan-400">TV Channels</span>
                    </h1>

                    <div className="relative w-full max-w-2xl">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-11 pr-4 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all shadow-xl backdrop-blur-sm"
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 sticky top-20 z-10 bg-[#0a0a0a]/80 backdrop-blur-md py-4 -mx-4 px-4 md:mx-0 md:px-0 md:static md:bg-transparent md:backdrop-blur-none">
                    {/* Categories */}
                    <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar mask-linear-fade">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-300 ${activeCategory === cat
                                    ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)] transform scale-105'
                                    : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800/50'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Language Toggles */}
                    <div className="flex gap-2 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800/50">
                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang}
                                onClick={() => setActiveLanguage(lang)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeLanguage === lang
                                    ? 'bg-slate-800 text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                {lang === 'All' ? 'All' : lang.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid Layout - 4 Columns on Desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filtered.map((ch, i) => (
                        <Link
                            key={i}
                            href={`/live/watch?url=${encodeURIComponent(ch.streamUrl)}&name=${encodeURIComponent(ch.name)}`}
                            className="group block relative"
                        >
                            {/* Card Poster Area */}
                            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-800/50 group-hover:border-cyan-500/50 transition-all duration-300 shadow-lg group-hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]">

                                {/* Background Image / Fallback */}
                                {ch.logo ? (
                                    <div className="absolute inset-0 p-8 flex items-center justify-center opacity-30 group-hover:opacity-20 transition-opacity grayscale group-hover:grayscale-0">
                                        <img src={ch.logo} alt="" className="max-h-full max-w-full object-contain" />
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950" />
                                )}

                                {/* Centered Text Overlay (Rivestream Style) */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
                                    <h3 className="text-xl md:text-2xl font-black text-white drop-shadow-lg tracking-tight group-hover:scale-110 transition-transform duration-300">
                                        {ch.name}
                                    </h3>
                                    {/* Play Button Overlay on Hover */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-[2px]">
                                        <div className="h-12 w-12 rounded-full bg-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.6)] transform scale-50 group-hover:scale-100 transition-transform duration-300 delay-75">
                                            <Play className="h-5 w-5 text-black fill-current ml-1" />
                                        </div>
                                    </div>
                                </div>

                                {/* Top Right: Live Badge */}
                                <div className="absolute top-3 right-3 z-20">
                                    <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/90 text-[10px] font-bold text-white uppercase tracking-wider shadow-lg backdrop-blur-md">
                                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                        Live
                                    </span>
                                </div>

                                {/* Bottom Right: Heart Icon */}
                                <div className="absolute bottom-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button className="p-2 rounded-full bg-black/50 hover:bg-rose-500/20 hover:text-rose-500 text-white/70 backdrop-blur-md transition-colors">
                                        <Heart className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Metadata Below Card */}
                            <div className="mt-3 px-1">
                                <h4 className="text-base font-bold text-slate-200 group-hover:text-cyan-400 transition-colors truncate">
                                    {ch.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        {ch.category}
                                    </span>
                                    <span className="text-xs text-slate-600">•</span>
                                    <span className="text-xs text-slate-500">
                                        {(ch.language && LANG_LABELS[ch.language]) || (ch.language || 'EN').toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 text-center opacity-60">
                        <Search className="h-12 w-12 text-slate-600 mb-4" />
                        <h3 className="text-xl font-bold text-slate-300">No channels found</h3>
                        <p className="text-slate-500 mt-2">Try adjusting your valid search or filters</p>
                    </div>
                )}
            </main>

            <EnhancedFooter />
        </div>
    )
}
