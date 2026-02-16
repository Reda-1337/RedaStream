'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, X, Film, Tv, TrendingUp } from 'lucide-react'

type SearchItem = {
    id: number
    title?: string
    name?: string
    poster_path?: string | null
    backdrop_path?: string | null
    release_date?: string
    first_air_date?: string
    vote_average?: number
    media_type?: 'movie' | 'tv' | 'person'
    overview?: string
}

type SearchResponse = {
    results: SearchItem[]
    total_results: number
    suggestions?: string[]
}

const POSTER_BASE = 'https://image.tmdb.org/t/p/w185'

export default function InstantSearch() {
    const router = useRouter()
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchItem[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const [suggestions, setSuggestions] = useState<string[]>([])

    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const abortRef = useRef<AbortController | null>(null)

    // Debounced search
    const doSearch = useCallback(async (q: string) => {
        if (q.trim().length < 2) {
            setResults([])
            setSuggestions([])
            setIsOpen(false)
            return
        }

        // Abort previous request
        if (abortRef.current) abortRef.current.abort()
        const controller = new AbortController()
        abortRef.current = controller

        setIsLoading(true)

        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}&type=all`, {
                signal: controller.signal,
            })
            if (!res.ok) throw new Error('Search failed')
            const data: SearchResponse = await res.json()
            const filtered = (data.results || []).filter(
                (item) => item.media_type !== 'person' && (item.poster_path || item.backdrop_path)
            )
            setResults(filtered.slice(0, 8))
            setSuggestions((data.suggestions || []).slice(0, 3))
            setIsOpen(true)
            setSelectedIndex(-1)
        } catch (e: any) {
            if (e.name !== 'AbortError') {
                setResults([])
                setSuggestions([])
            }
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Input handler with debounce
    const handleInput = useCallback(
        (value: string) => {
            setQuery(value)
            if (debounceRef.current) clearTimeout(debounceRef.current)
            if (value.trim().length < 2) {
                setResults([])
                setIsOpen(false)
                return
            }
            setIsLoading(true)
            debounceRef.current = setTimeout(() => doSearch(value), 300)
        },
        [doSearch]
    )

    // Keyboard navigation
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            const totalItems = results.length + suggestions.length

            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0))
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1))
            } else if (e.key === 'Enter') {
                e.preventDefault()
                if (selectedIndex >= 0 && selectedIndex < results.length) {
                    const item = results[selectedIndex]
                    const type = item.media_type === 'tv' ? 'tv' : 'movie'
                    router.push(`/${type}/${item.id}`)
                    setIsOpen(false)
                    setQuery('')
                } else if (selectedIndex >= results.length && selectedIndex < results.length + suggestions.length) {
                    const suggestion = suggestions[selectedIndex - results.length]
                    router.push(`/search?q=${encodeURIComponent(suggestion)}`)
                    setIsOpen(false)
                    setQuery('')
                } else if (query.trim()) {
                    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
                    setIsOpen(false)
                }
            } else if (e.key === 'Escape') {
                setIsOpen(false)
                inputRef.current?.blur()
            }
        },
        [results, suggestions, selectedIndex, query, router]
    )

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    // Cleanup
    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
            if (abortRef.current) abortRef.current.abort()
        }
    }, [])

    const getItemHref = (item: SearchItem) => {
        const type = item.media_type === 'tv' ? 'tv' : 'movie'
        return `/${type}/${item.id}`
    }

    const getItemTitle = (item: SearchItem) => item.title || item.name || 'Untitled'

    const getItemYear = (item: SearchItem) => {
        const date = item.release_date || item.first_air_date
        return date ? date.slice(0, 4) : ''
    }

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Search Input */}
            <div className="flex w-full items-center gap-3 rounded-2xl border border-slate-700/50 bg-slate-900/70 px-4 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-sm transition-all duration-300 focus-within:border-cyan-400/60 focus-within:shadow-[0_4px_30px_rgba(6,182,212,0.15)] focus-within:bg-slate-900/90">
                <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => handleInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => { if (results.length > 0) setIsOpen(true) }}
                    placeholder="Search movies, TV series…"
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none sm:text-base"
                    autoComplete="off"
                    spellCheck={false}
                />
                {isLoading && (
                    <div className="w-4 h-4 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin flex-shrink-0" />
                )}
                {query && !isLoading && (
                    <button
                        onClick={() => { setQuery(''); setResults([]); setIsOpen(false); inputRef.current?.focus() }}
                        className="flex-shrink-0 text-slate-500 hover:text-white transition"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
                {query.trim().length >= 2 && (
                    <button
                        onClick={() => {
                            router.push(`/search?q=${encodeURIComponent(query.trim())}`)
                            setIsOpen(false)
                        }}
                        className="hidden sm:inline-flex rounded-xl bg-gradient-to-r from-red-600 to-rose-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:from-red-500 hover:to-rose-400 shadow-[0_4px_15px_rgba(239,68,68,0.3)]"
                    >
                        Search
                    </button>
                )}
            </div>

            {/* Dropdown Results */}
            {isOpen && (results.length > 0 || suggestions.length > 0) && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-slate-700/50 bg-slate-950/95 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl">

                    {/* Results */}
                    {results.length > 0 && (
                        <div className="p-2">
                            <div className="flex items-center gap-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                <TrendingUp className="h-3 w-3" />
                                Results
                            </div>
                            {results.map((item, index) => {
                                const isSelected = selectedIndex === index
                                return (
                                    <Link
                                        key={`${item.media_type}-${item.id}`}
                                        href={getItemHref(item) as any}
                                        onClick={() => { setIsOpen(false); setQuery('') }}
                                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 ${isSelected
                                                ? 'bg-slate-800/80 shadow-sm'
                                                : 'hover:bg-slate-800/50'
                                            }`}
                                    >
                                        {/* Poster thumbnail */}
                                        <div className="relative h-16 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-slate-800">
                                            {item.poster_path ? (
                                                <Image
                                                    src={`${POSTER_BASE}${item.poster_path}`}
                                                    alt={getItemTitle(item)}
                                                    fill
                                                    sizes="44px"
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-slate-600">
                                                    {item.media_type === 'tv' ? <Tv className="h-4 w-4" /> : <Film className="h-4 w-4" />}
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{getItemTitle(item)}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${item.media_type === 'tv'
                                                        ? 'bg-purple-500/15 text-purple-300'
                                                        : 'bg-cyan-500/15 text-cyan-300'
                                                    }`}>
                                                    {item.media_type === 'tv' ? <Tv className="h-2.5 w-2.5" /> : <Film className="h-2.5 w-2.5" />}
                                                    {item.media_type === 'tv' ? 'TV' : 'Movie'}
                                                </span>
                                                {getItemYear(item) && (
                                                    <span className="text-xs text-slate-500">{getItemYear(item)}</span>
                                                )}
                                                {typeof item.vote_average === 'number' && item.vote_average > 0 && (
                                                    <span className="text-xs text-amber-400">★ {item.vote_average.toFixed(1)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    )}

                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                        <div className="border-t border-slate-800/60 p-2">
                            <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                Suggestions
                            </div>
                            {suggestions.map((s, i) => {
                                const isSelected = selectedIndex === results.length + i
                                return (
                                    <Link
                                        key={s}
                                        href={`/search?q=${encodeURIComponent(s)}`}
                                        onClick={() => { setIsOpen(false); setQuery('') }}
                                        className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-150 ${isSelected ? 'bg-slate-800/80 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                                            }`}
                                    >
                                        <Search className="h-3.5 w-3.5 flex-shrink-0" />
                                        {s}
                                    </Link>
                                )
                            })}
                        </div>
                    )}

                    {/* View All */}
                    {query.trim() && (
                        <div className="border-t border-slate-800/60 p-2">
                            <Link
                                href={`/search?q=${encodeURIComponent(query.trim())}`}
                                onClick={() => { setIsOpen(false); setQuery('') }}
                                className="flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-cyan-400 transition hover:bg-slate-800/50 hover:text-cyan-300"
                            >
                                View all results for &ldquo;{query.trim()}&rdquo;
                                <span className="text-cyan-600">→</span>
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {/* No results state */}
            {isOpen && query.trim().length >= 2 && results.length === 0 && !isLoading && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-slate-700/50 bg-slate-950/95 p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                    <p className="text-sm text-slate-400">No results found for &ldquo;{query}&rdquo;</p>
                    <p className="text-xs text-slate-600 mt-1">Try a different spelling or search term</p>
                </div>
            )}
        </div>
    )
}
