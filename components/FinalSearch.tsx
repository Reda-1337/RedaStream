"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, X, Film, Tv, Loader2 } from 'lucide-react'

interface SearchResult {
  id: number
  title?: string
  name?: string
  media_type: 'movie' | 'tv' | 'person'
  poster_path?: string | null
  release_date?: string
  first_air_date?: string
}

export default function FinalSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [appliedQuery, setAppliedQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)

  const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w92'

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.length > 2) {
        performSearch(searchTerm)
      } else {
        setSearchResults([])
        setSuggestions([])
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [searchTerm])

  const performSearch = async (query: string) => {
    const trimmed = query.trim()
    if (trimmed.length < 3) {
      setSearchResults([])
      setSuggestions([])
      setAppliedQuery(trimmed)
      setShowResults(trimmed.length > 0)
      setLoading(false)
      return
    }

    setLoading(true)
    setShowResults(true)
    setSuggestions([])
    setAppliedQuery(trimmed)

    try {
      const params = new URLSearchParams({ q: trimmed, type: 'all' })
      const response = await fetch(`/api/search?${params.toString()}`)

      if (response.status === 400) {
        setSearchResults([])
        setSuggestions([])
        setAppliedQuery(trimmed)
        return
      }

      if (!response.ok) {
        throw new Error(`Search API failed: ${response.status}`)
      }

      const data = await response.json()
      const filtered = Array.isArray(data.results)
        ? data.results.filter((item: SearchResult) => item.media_type !== 'person')
        : []
      setSearchResults(filtered)
      setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : [])
      if (typeof data.appliedQuery === 'string' && data.appliedQuery.length > 0) {
        setAppliedQuery(data.appliedQuery)
      }
    } catch (error) {
      console.error('Error fetching search results:', error)
      setSearchResults([])
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const clearSearch = () => {
    setSearchTerm('')
    setSearchResults([])
    setSuggestions([])
    setAppliedQuery('')
    setShowResults(false)
    setLoading(false)
  }

  const handleResultClick = (result: SearchResult) => {
    clearSearch()
    if (result.media_type === 'movie') {
      router.push(`/movie/${result.id}`)
    } else if (result.media_type === 'tv') {
      router.push(`/tv/${result.id}`)
    }
  }

  const handleSuggestionClick = (value: string) => {
    setSearchTerm(value)
    performSearch(value)
  }

  const getItemTitle = (item: SearchResult) => item.title || item.name || 'Untitled'
  const getItemYear = (item: SearchResult) => {
    const date = item.release_date || item.first_air_date || ''
    return date ? date.slice(0, 4) : 'N/A'
  }

  return (
    <div className="relative w-full lg:w-96" ref={searchRef}>
      <div className="flex items-center bg-gray-800/70 border border-gray-700/50 rounded-full px-4 py-2 shadow-lg focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all duration-200">
        <Search className="text-gray-400 mr-3" size={20} />
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => searchTerm.length > 2 && setShowResults(true)}
          placeholder="Search movies, TV shows..."
          className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-base"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={clearSearch}
            className="ml-3 text-gray-400 hover:text-white transition-colors"
            aria-label="Clear search"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {showResults && (loading || searchResults.length > 0 || suggestions.length > 0) && (
        <div className="absolute left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
          {loading && (
            <div className="flex items-center justify-center p-4 text-white">
              <Loader2 className="animate-spin mr-2" size={20} /> Loading...
            </div>
          )}

          {!loading && appliedQuery && appliedQuery !== searchTerm && (
            <div className="px-4 py-2 text-xs text-gray-400">
              Showing closest matches for "{appliedQuery}".
            </div>
          )}

          {!loading && suggestions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 px-4 py-2 text-xs text-gray-400">
              <span>Did you mean</span>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="rounded-full border border-purple-400/40 bg-purple-500/10 px-3 py-1 text-purple-200 transition hover:border-purple-300/60"
                >
                  "{suggestion}"
                </button>
              ))}
              <span>?</span>
            </div>
          )}

          {!loading && searchResults.length === 0 && appliedQuery && (
            <div className="p-4 text-gray-400 text-center">No results found for "{appliedQuery}"</div>
          )}

          {!loading && searchResults.length > 0 && (
            <ul>
              {searchResults.map((result) => (
                <li key={`${result.media_type}-${result.id}`} className="border-b border-gray-700 last:border-b-0">
                  <button
                    onClick={() => handleResultClick(result)}
                    className="flex items-center w-full p-3 hover:bg-gray-700 transition-colors text-left"
                  >
                    <div className="relative w-12 h-18 flex-shrink-0 mr-3 bg-gray-700 rounded overflow-hidden">
                      {result.poster_path ? (
                        <Image
                          src={`${TMDB_IMAGE_BASE_URL}${result.poster_path}`}
                          alt={getItemTitle(result)}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          {result.media_type === 'movie' ? <Film size={20} /> : <Tv size={20} />}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-sm">{getItemTitle(result)}</h3>
                      <p className="text-gray-400 text-xs">
                        {getItemTypeIcon(result.media_type)} {result.media_type === 'movie' ? 'Movie' : 'TV Show'} - {getItemYear(result)}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function getItemTypeIcon(mediaType: 'movie' | 'tv' | 'person') {
  if (mediaType === 'movie') {
    return <Film size={12} className="inline-block mr-1" />
  }
  if (mediaType === 'tv') {
    return <Tv size={12} className="inline-block mr-1" />
  }
  return null
}


