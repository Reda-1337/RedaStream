// NOTE: Keep the blank line between exports and imports. A stray literal "\nimport" once slipped in and blanked the route.
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Header from '@/components/Header'
import FiltersBar from '@/components/FiltersBar'
import EnhancedFooter from '@/components/EnhancedFooter'
import CatalogResults from '@/components/CatalogResults'
import { fetchCatalogFilters, getLanguageLabel } from '@/lib/catalog'
import { tmdbFetch } from '@/lib/tmdb'
import { Suspense } from 'react'

type SearchParams = Record<string, string | string[] | undefined>

type MovieResponse = {
  results?: any[]
  total_results?: number
  total_pages?: number
}

const movieSortMeta: Record<string, { label: string; description: string }> = {
  'popularity.desc': {
    label: 'Most Popular',
    description: 'Ranking by current TMDB popularity trends.'
  },
  'vote_average.desc': {
    label: 'Top Rated',
    description: 'Curated by global viewer ratings and reviews.'
  },
  'primary_release_date.desc': {
    label: 'Newest Releases',
    description: 'Fresh theatrical releases and recent digital drops.'
  }
}

function FiltersSkeleton() {
  return (
    <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
      {[0, 1, 2].map((key) => (
        <div
          key={key}
          className="h-11 animate-pulse rounded-xl border border-slate-800/70 bg-slate-900/60"
        />
      ))}
    </div>
  )
}

function normalizeMovieParams(searchParams: SearchParams) {
  const params = new URLSearchParams()

  for (const [key, rawValue] of Object.entries(searchParams || {})) {
    if (key === 'page') continue
    if (rawValue === undefined || rawValue === null) continue
    const value = Array.isArray(rawValue) ? rawValue[rawValue.length - 1] : rawValue
    if (value) params.set(key, value)
  }

  const sortSlug = params.get('sort')
  if (sortSlug) {
    if (!params.has('sort_by')) {
      const sortMap: Record<string, string> = {
        popular: 'popularity.desc',
        popularity: 'popularity.desc',
        rating: 'vote_average.desc',
        top: 'vote_average.desc',
        upcoming: 'primary_release_date.desc',
        newest: 'primary_release_date.desc'
      }
      const mappedSort = sortMap[sortSlug.toLowerCase()] || 'popularity.desc'
      params.set('sort_by', mappedSort)
    }
    params.delete('sort')
  }

  if (!params.has('sort_by')) {
    params.set('sort_by', 'popularity.desc')
  }

  params.delete('page')

  return params
}

async function getMovies(params: URLSearchParams, page: number) {
  const query = {} as Record<string, string>
  for (const [key, value] of params.entries()) {
    if (!value) continue
    query[key] = value
  }
  query.page = String(page)
  if (!query.sort_by) {
    query.sort_by = 'popularity.desc'
  }
  if (query.year) {
    query.primary_release_year = query.year
    delete query.year
  }
  try {
    return await tmdbFetch<MovieResponse>('/discover/movie', query)
  } catch (error) {
    console.error('Failed to load movie catalog', error)
    return { results: [] }
  }
}

function formatResultsCount(value?: number) {
  if (!value || !Number.isFinite(value)) return '-'
  if (value >= 1000) {
    const rounded = Math.round(value / 100) * 100
    return `${rounded.toLocaleString('en-US')}+`
  }
  return value.toLocaleString('en-US')
}

function coercePage(searchParams: SearchParams) {
  const raw = searchParams?.page
  const value = Array.isArray(raw) ? raw[raw.length - 1] : raw
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

export default async function MoviesPage({ searchParams }: { searchParams: SearchParams }) {
  const normalizedParams = normalizeMovieParams(searchParams)
  const initialPage = coercePage(searchParams)
  const queryString = normalizedParams.toString()

  const [movieData, filters] = await Promise.all([
    getMovies(normalizedParams, initialPage),
    fetchCatalogFilters()
  ])

  const items = Array.isArray(movieData.results) ? movieData.results : []
  const totalResults = typeof movieData.total_results === 'number' ? movieData.total_results : items.length
  const totalPages = typeof movieData.total_pages === 'number' ? movieData.total_pages : 1

  const sortValue = normalizedParams.get('sort_by') || 'popularity.desc'
  const genreValue = normalizedParams.get('with_genres') || ''
  const yearValue = normalizedParams.get('year') || ''
  const languageValue = normalizedParams.get('with_original_language') || ''

  const sortMeta = movieSortMeta[sortValue] || movieSortMeta['popularity.desc']
  const primaryGenreId = genreValue.split(',').map((entry) => entry.trim()).find(Boolean) || ''
  const movieGenres = filters.movieGenres || []
  const activeGenre = movieGenres.find((genre) => String(genre.id) === primaryGenreId)?.name || ''
  const computedTitle = activeGenre ? `${activeGenre} Movies` : 'Popular Movies'
  const languageLabel = languageValue ? getLanguageLabel(languageValue) : 'All Languages'
  const highlightDescription = [
    sortMeta.description,
    yearValue ? `Focusing on releases from ${yearValue}.` : null,
    languageValue ? `Original audio in ${languageLabel}.` : null,
    !activeGenre ? 'Explore what everyone is watching right now.' : null
  ]
    .filter(Boolean)
    .join(' ')

  const badges = [
    { label: 'Sort', value: sortMeta.label },
    { label: 'Genre', value: activeGenre || 'All Genres' },
    { label: 'Year', value: yearValue || 'All Years' },
    { label: 'Language', value: languageLabel || 'All Languages' },
    { label: 'Results', value: formatResultsCount(totalResults) }
  ]

  const hasResults = items.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black">
      <Header />
      <main className="mx-auto w-full max-w-7xl space-y-10 px-6 pb-20 pt-10">
        <section className="glass-panel overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950/80 p-8 shadow-[0_20px_80px_rgba(8,47,73,0.35)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/80">Movie Catalog</p>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">{computedTitle}</h1>
              <p className="text-base text-slate-300/80">{highlightDescription}</p>
            </div>
            <div className="flex flex-wrap items-start gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.label}
                  className="rounded-full border border-slate-800/60 bg-slate-900/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-300/80"
                >
                  <span className="mr-2 text-slate-500">{badge.label}</span>
                  <span className="text-white">{badge.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <Suspense fallback={<FiltersSkeleton />}>
            <FiltersBar type="movie" initialGenres={filters.movieGenres} initialYears={filters.years} />
          </Suspense>

          {hasResults ? (
            <div className="rounded-3xl border border-slate-900/60 bg-slate-950/70 p-6 shadow-[0_12px_50px_rgba(7,16,45,0.35)]">
              <CatalogResults key={`movie-${queryString}-p${initialPage}`}
                type="movie"
                initialItems={items}
                initialPage={initialPage}
                initialTotalPages={totalPages}
                queryKey={`movie-${queryString}-p${initialPage}`}
                queryString={queryString}
              />
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-900/70 bg-slate-950/60 p-10 text-center shadow-[0_12px_50px_rgba(7,16,45,0.35)]">
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                <span className="text-2xl font-bold">!</span>
              </div>
              <h2 className="mb-2 text-2xl font-semibold text-white">No movies match these filters</h2>
              <p className="mx-auto mb-6 max-w-xl text-sm text-slate-400">
                Try adjusting the genre, year, language, or sort order. You can also clear your filters to jump back into the full TMDB catalog.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/movies"
                  className="inline-flex items-center rounded-full border border-cyan-400/60 bg-cyan-500/10 px-5 py-2 text-sm font-semibold text-cyan-200 transition hover:-translate-y-0.5 hover:bg-cyan-500/20"
                >
                  Reset filters
                </Link>
                <Link
                  href="/search"
                  className="inline-flex items-center rounded-full border border-slate-800/70 bg-slate-900/80 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:-translate-y-0.5 hover:border-cyan-400/40 hover:text-white"
                >
                  Discover titles
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>
      <EnhancedFooter />
    </div>
  )
}

