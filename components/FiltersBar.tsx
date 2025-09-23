"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { COMMON_LANGUAGES } from '@/lib/catalog'

type Genre = { id: number; name: string }

type Props = {
  type: 'movie' | 'tv'
  initialGenres?: Genre[]
  initialYears?: string[]
}

const controlClass =
  'w-full rounded-2xl border border-slate-800/60 bg-slate-950/70 px-4 py-3 text-sm text-slate-200 shadow-[0_8px_25px_rgba(8,47,73,0.15)] transition hover:border-cyan-500/30 focus:border-cyan-400 focus:outline-none'

export default function FiltersBar({ type, initialGenres, initialYears }: Props) {
  const router = useRouter()
  const params = useSearchParams()

  const [genres, setGenres] = useState<Genre[]>(initialGenres || [])
  const [years, setYears] = useState<string[]>(initialYears || [])
  const [isLoaded, setIsLoaded] = useState(Boolean((initialGenres?.length || 0) > 0 || (initialYears?.length || 0) > 0))

  const currentGenre = params.get('with_genres') || ''
  const currentYear = params.get('year') || ''
  const currentLanguage = params.get('with_original_language') || ''
  const currentSort = params.get('sort_by') || 'popularity.desc'

  const defaultSort = 'popularity.desc'

  const sortOptions = useMemo(() => {
    if (type === 'movie') {
      return [
        { value: 'popularity.desc', label: 'Popularity' },
        { value: 'vote_average.desc', label: 'Rating' },
        { value: 'primary_release_date.desc', label: 'Newest' }
      ]
    }
    return [
      { value: 'popularity.desc', label: 'Popularity' },
      { value: 'vote_average.desc', label: 'Rating' },
      { value: 'first_air_date.desc', label: 'Newest' }
    ]
  }, [type])

  useEffect(() => {
    const hasInitialData = Boolean((initialGenres?.length || 0) > 0 || (initialYears?.length || 0) > 0)
    if (hasInitialData) {
      setGenres(initialGenres || [])
      setYears(initialYears || [])
      setIsLoaded(true)
      return
    }

    let isMounted = true
    fetch('/api/filters')
      .then((response) => response.json())
      .then((payload) => {
        if (!isMounted) return
        setGenres(((type === 'movie' ? payload.movieGenres : payload.tvGenres) || []) as Genre[])
        setYears((payload.years || []) as string[])
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoaded(true)
      })

    return () => {
      isMounted = false
    }
  }, [initialGenres, initialYears, type])

  const updateQuery = useCallback(
    (next: Record<string, string | null | undefined>) => {
      const current = new URLSearchParams(params.toString())
      for (const [key, value] of Object.entries(next)) {
        if (typeof value === 'string' && value.length > 0) {
          current.set(key, value)
        } else {
          current.delete(key)
        }
      }
      current.delete('page')
      const search = current.toString()
      const pathname = window.location.pathname
      const target = search ? `${pathname}?${search}` : pathname
      router.push(target)
      router.refresh()
    },
    [params, router]
  )

  const handleReset = useCallback(() => {
    updateQuery({
      with_genres: '',
      year: '',
      with_original_language: '',
      sort_by: defaultSort
    })
  }, [defaultSort, updateQuery])

  const removeFilter = useCallback(
    (key: 'with_genres' | 'year' | 'with_original_language' | 'sort_by') => {
      if (key === 'sort_by') {
        updateQuery({ sort_by: defaultSort })
        return
      }
      updateQuery({ [key]: '' })
    },
    [defaultSort, updateQuery]
  )

  const activeFilters = useMemo(() => {
    const entries: Array<{ key: 'with_genres' | 'year' | 'with_original_language' | 'sort_by'; label: string; value: string }> = []
    if (currentGenre) {
      const genreName = genres.find((genre) => String(genre.id) === currentGenre)?.name || 'Selected'
      entries.push({ key: 'with_genres', label: 'Genre', value: genreName })
    }
    if (currentYear) {
      entries.push({ key: 'year', label: 'Year', value: currentYear })
    }
    if (currentLanguage) {
      const languageName = COMMON_LANGUAGES.find((language) => language.value === currentLanguage)?.label || currentLanguage.toUpperCase()
      entries.push({ key: 'with_original_language', label: 'Language', value: languageName })
    }
    if (currentSort && currentSort !== defaultSort) {
      const sortName = sortOptions.find((option) => option.value === currentSort)?.label || currentSort
      entries.push({ key: 'sort_by', label: 'Sort', value: sortName })
    }
    return entries
  }, [currentGenre, currentLanguage, currentSort, currentYear, defaultSort, genres, sortOptions])

  const canReset = activeFilters.length > 0 || currentSort !== defaultSort

  return (
    <div className="glass-panel rounded-3xl border border-slate-900/60 bg-slate-950/70 p-5 shadow-[0_18px_50px_rgba(7,16,45,0.25)]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {sortOptions.map((option) => {
              const isActive = option.value === currentSort
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateQuery({ sort_by: option.value })}
                  className={`inline-flex items-center rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                    isActive
                      ? 'border-cyan-400/60 bg-cyan-500/10 text-cyan-100 shadow-[0_10px_30px_rgba(6,182,212,0.35)]'
                      : 'border-transparent bg-slate-900/60 text-slate-400 hover:border-slate-700/60 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
          <button
            type="button"
            onClick={handleReset}
            disabled={!canReset}
            className={`inline-flex items-center gap-2 self-start rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition md:self-auto ${
              canReset
                ? 'border-slate-800/70 bg-slate-900/70 text-slate-300 hover:border-cyan-400/40 hover:text-white'
                : 'border-slate-900/70 bg-slate-950/70 text-slate-600 cursor-not-allowed'
            }`}
          >
            Reset Filters
          </button>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {activeFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => removeFilter(filter.key)}
                className="group inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100 transition hover:border-cyan-300/50"
              >
                <span>{`${filter.label}: ${filter.value}`}</span>
                <span className="text-cyan-200 group-hover:text-white">x</span>
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <select
            className={controlClass}
            value={currentGenre}
            onChange={(e) => updateQuery({ with_genres: e.target.value })}
            disabled={!isLoaded}
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>

          <select
            className={controlClass}
            value={currentYear}
            onChange={(e) => updateQuery({ year: e.target.value })}
            disabled={!isLoaded}
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <select
            className={controlClass}
            value={currentLanguage}
            onChange={(e) => updateQuery({ with_original_language: e.target.value })}
          >
            <option value="">All Languages</option>
            {COMMON_LANGUAGES.map((language) => (
              <option key={language.value} value={language.value}>
                {language.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
