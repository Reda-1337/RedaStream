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

type TvResponse = {
  results?: any[]
  total_results?: number
  total_pages?: number
}

const tvSortMeta: Record<string, { label: string; description: string }> = {
  'popularity.desc': {
    label: 'Most Popular',
    description: 'Series that are trending across TMDB this week.'
  },
  'vote_average.desc': {
    label: 'Top Rated',
    description: 'Fan favourites ranked by audience scores.'
  },
  'first_air_date.desc': {
    label: 'Newest Premieres',
    description: 'Fresh episodes and brand-new series breaking out now.'
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

function normalizeTvParams(searchParams: SearchParams) {
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
        upcoming: 'first_air_date.desc',
        newest: 'first_air_date.desc'
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

async function getTvShows(params: URLSearchParams, page: number) {
  const query = {} as Record<string, string>
  for (const [key, value] of params.entries()) {
    if (!value) continue
    query[key] = value
  }
  query.page = String(page)
  if (!query.sort_by) {
    query.sort_by = 'popularity.desc'
  }
  const year = query.first_air_date_year || query.year
  if (year) {
    query.first_air_date_year = year
    delete query.year
  }
  try {
    return await tmdbFetch<TvResponse>('/discover/tv', query)
  } catch (error) {
    console.error('Failed to load tv catalog', error)
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

export default async function TvPage({ searchParams }: { searchParams: SearchParams }) {
  const normalizedParams = normalizeTvParams(searchParams)
  const initialPage = coercePage(searchParams)
  const queryString = normalizedParams.toString()

  const [tvData, filters] = await Promise.all([
    getTvShows(normalizedParams, initialPage),
    fetchCatalogFilters()
  ])

  const items = Array.isArray(tvData.results) ? tvData.results : []
  const totalResults = typeof tvData.total_results === 'number' ? tvData.total_results : items.length
  const totalPages = typeof tvData.total_pages === 'number' ? tvData.total_pages : 1

  const sortValue = normalizedParams.get('sort_by') || 'popularity.desc'
  const genreValue = normalizedParams.get('with_genres') || ''
  const yearValue = normalizedParams.get('first_air_date_year') || normalizedParams.get('year') || ''
  const languageValue = normalizedParams.get('with_original_language') || ''

  const sortMeta = tvSortMeta[sortValue] || tvSortMeta['popularity.desc']
  const primaryGenreId = genreValue.split(',').map((entry) => entry.trim()).find(Boolean) || ''
  const tvGenres = filters.tvGenres || []
  const activeGenre = tvGenres.find((genre) => String(genre.id) === primaryGenreId)?.name || ''
  const computedTitle = activeGenre ? `${activeGenre} Series` : 'Popular TV Shows'
  const languageLabel = languageValue ? getLanguageLabel(languageValue) : 'All Languages'
  const highlightDescription = [
    sortMeta.description,
    yearValue ? `Spotlighting premieres from ${yearValue}.` : null,
    languageValue ? `Original audio in ${languageLabel}.` : null,
    !activeGenre ? 'Dial into binge-worthy episodes and essential rewatches.' : null
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
        <section className="glass-panel overflow-hidden rounded-3xl border border-indigo-800/60 bg-slate-950/80 p-8 shadow-[0_20px_80px_rgba(23,37,84,0.35)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <p className="text-xs uppercase tracking-[0.4em] text-indigo-300/80">TV Catalog</p>
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
            <FiltersBar type="tv" initialGenres={filters.tvGenres} initialYears={filters.years} />
          </Suspense>

          {hasResults ? (
            <div className="rounded-3xl border border-slate-900/60 bg-slate-950/70 p-6 shadow-[0_12px_50px_rgba(17,24,39,0.35)]">
              <CatalogResults key={`tv-${queryString}-p${initialPage}`}
                type="tv"
                initialItems={items}
                initialPage={initialPage}
                initialTotalPages={totalPages}
                queryKey={`tv-${queryString}-p${initialPage}`}
                queryString={queryString}
              />
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-900/70 bg-slate-950/60 p-10 text-center shadow-[0_12px_50px_rgba(17,24,39,0.35)]">
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300">
                <span className="text-2xl font-bold">!</span>
              </div>
              <h2 className="mb-2 text-2xl font-semibold text-white">No shows match these filters</h2>
              <p className="mx-auto mb-6 max-w-xl text-sm text-slate-400">
                Relax the filters or browse the trending series list to jump back into proven crowd favourites.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/tv"
                  className="inline-flex items-center rounded-full border border-indigo-400/60 bg-indigo-500/10 px-5 py-2 text-sm font-semibold text-indigo-100 transition hover:-translate-y-0.5 hover:bg-indigo-500/20"
                >
                  Reset filters
                </Link>
                <Link
                  href="/search?type=tv"
                  className="inline-flex items-center rounded-full border border-slate-800/70 bg-slate-900/80 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:-translate-y-0.5 hover:border-indigo-400/40 hover:text-white"
                >
                  Browse discover
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

