"use client"

import Image from 'next/image'
import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, X, Loader2, Star, Calendar, Play } from 'lucide-react'

type SearchResult = {
  id: number
  title?: string
  name?: string
  poster_path?: string | null
  release_date?: string
  first_air_date?: string
  vote_average?: number
  media_type?: 'movie' | 'tv' | 'person'
  overview?: string
}

export default function EnhancedSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [error, setError] = useState<string | null>(null)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Debounced search function
  const performSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([])
      setHasSearched(false)
      setError(null)
      return
    }

    setIsSearching(true)
    setHasSearched(true)
    setError(null)

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      
      if (response.ok) {
        const data = await response.json()
        const sanitized = Array.isArray(data.results)
          ? (data.results as SearchResult[]).filter((item) => item.media_type !== 'person')
          : []
        setSearchResults(sanitized)
        setShowDropdown(sanitized.length > 0)
      } else {
        console.error('Search failed:', response.status)
        setSearchResults([])
        setError('Search request failed. Try again later.')
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
      setError('Unable to reach search service.')
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    setSelectedIndex(-1)

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value)
    }, 300)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || searchResults.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          const selectedItem = searchResults[selectedIndex]
          const mediaType = selectedItem.media_type || (selectedItem.name ? 'tv' : 'movie')
          window.location.href = `/${mediaType}/${selectedItem.id}`
        }
        break
      case 'Escape':
        setShowDropdown(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // Clear search
  const clearSearch = () => {
    setSearchTerm('')
    setSearchResults([])
    setHasSearched(false)
    setShowDropdown(false)
    setSelectedIndex(-1)
    setError(null)
    inputRef.current?.focus()
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  const getItemTitle = (item: SearchResult) => item.title || item.name || 'Untitled'
  const getItemYear = (item: SearchResult) => {
    const date = item.release_date || item.first_air_date || ''
    return date ? date.slice(0, 4) : ''
  }
  const getItemType = (item: SearchResult) => item.media_type || (item.name ? 'tv' : 'movie')

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
          placeholder="Search movies, TV shows, genres..."
          className="w-full rounded-2xl border border-slate-700/60 bg-slate-900/70 py-3 pl-12 pr-14 text-sm text-slate-100 shadow-[0_10px_30px_rgba(8,47,73,0.35)] transition focus:border-cyan-400/70 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 placeholder:text-slate-500"
        />
        
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-10 flex items-center text-slate-400 transition hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        
        {isSearching && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-300" />
          </div>
        )}
      </div>

      {/* Search Status */}
      {hasSearched && !isSearching && (
        <div className="mt-2 px-1 text-xs text-slate-400">
          {error ? (
            <span className="text-rose-400">{error}</span>
          ) : searchResults.length > 0 ? (
            <span>Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</span>
          ) : searchTerm.trim().length >= 2 ? (
            <span>No results found for "{searchTerm}"</span>
          ) : null}
        </div>
      )}

      {/* Search Results Dropdown */}
      {showDropdown && searchResults.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-[calc(100%+0.75rem)] left-0 right-0 z-50 max-h-96 overflow-y-auto rounded-3xl border border-slate-800/40 bg-slate-950/85 backdrop-blur-2xl shadow-[0_30px_70px_rgba(8,47,73,0.55)]"
        >
          {searchResults.slice(0, 8).map((item, index) => {
            const title = getItemTitle(item)
            const year = getItemYear(item)
            const mediaType = getItemType(item)
            const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A'
            const isSelected = index === selectedIndex

            return (
              <Link
                key={`${mediaType}-${item.id}`}
                href={`/${mediaType}/${item.id}`}
                className={`block border-b border-slate-800/30 p-4 transition-colors last:border-b-0 ${
                  isSelected ? 'bg-slate-900/60' : 'hover:bg-slate-900/40'
                }`}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-center gap-4">
                  {/* Poster */}
                  <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-900">
                    {item.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                        alt={title}
                        fill
                        sizes="64px"
                        className="h-full w-full rounded-lg object-cover"
                        onError={(event) => {
                          const target = event.currentTarget as HTMLImageElement
                          target.style.display = 'none'
                          const fallback = target.parentElement?.querySelector('.poster-fallback') as HTMLElement | null
                          fallback?.classList.remove('hidden')
                        }}
                      />
                    ) : null}
                    <div className={`poster-fallback flex h-full w-full items-center justify-center ${item.poster_path ? 'hidden' : ''}`}>
                      <Play className="h-6 w-6 text-slate-500" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate text-sm font-semibold text-white">{title}</h3>
                    
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                      <span className={`capitalize rounded-full px-2 py-1 text-[10px] font-semibold tracking-wide ${
                        mediaType === 'movie' 
                          ? 'bg-cyan-500/15 text-cyan-200' 
                          : 'bg-purple-500/15 text-purple-200'
                      }`}>
                        {mediaType}
                      </span>
                      
                      {year && (
                        <div className="flex items-center gap-1 text-slate-300">
                          <Calendar className="h-3 w-3" />
                          <span>{year}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 text-amber-300">
                        <Star className="h-3 w-3" />
                        <span>{rating}</span>
                      </div>
                    </div>

                    {item.overview && (
                      <p className="mt-2 line-clamp-2 text-xs text-slate-400">
                        {item.overview}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}


