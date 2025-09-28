import Header from '@/components/Header'
import EnhancedFooter from '@/components/EnhancedFooter'
import SearchResultsClient from '@/components/SearchResultsClient'
import { advancedSearch, type AdvancedSearchResult, type SearchType } from '@/lib/search'
import Link from 'next/link'

const filters = [
  { label: 'All Results', value: 'all' as const },
  { label: 'Movies', value: 'movie' as const },
  { label: 'TV Series', value: 'tv' as const }
]

async function fetchResults(query: string, type: SearchType, page: string) {
  return advancedSearch(query, type, page)
}

type Props = {
  searchParams: { q?: string; type?: string; page?: string }
}

function buildQueryLink(query: string, type: SearchType, page: string) {
  const params = new URLSearchParams()
  if (query) params.set('q', query)
  if (type !== 'all') params.set('type', type)
  if (page !== '1') params.set('page', page)
  return `/search?${params.toString()}`
}

export default async function SearchPage({ searchParams }: Props) {
  const query = searchParams.q?.toString() ?? ''
  const typeParam = (searchParams.type?.toString() ?? 'all') as SearchType
  const page = searchParams.page?.toString() ?? '1'

  const data: AdvancedSearchResult = await fetchResults(query, typeParam, page)
  const results = Array.isArray(data.results) ? data.results : []
  const totalResults = data.total_results ?? results.length
  const suggestions = Array.isArray(data.suggestions) ? data.suggestions : []

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="flex flex-wrap items-center gap-3 rounded-[28px] border border-slate-800/40 bg-slate-950/60 px-4 py-3 text-xs uppercase tracking-[0.3em] text-slate-400">
          {filters.map((filter) => {
            const isActive = typeParam === filter.value
            const target = buildQueryLink(query, filter.value, page)

            return (
              <Link
                key={filter.value}
                href={target}
                className={`inline-flex flex-shrink-0 items-center gap-2 rounded-full border px-4 py-2 transition ${
                  isActive
                    ? 'border-cyan-400/60 bg-cyan-500/10 text-cyan-100 shadow-[0_12px_28px_rgba(6,182,212,0.35)]'
                    : 'border border-transparent bg-slate-900/70 text-slate-400 hover:border-slate-700/60 hover:text-white'
                }`}
              >
                {filter.label}
              </Link>
            )
          })}
        </div>

        <SearchResultsClient
          query={query}
          type={typeParam}
          initialPage={Number(page) || 1}
          initialResults={results}
          initialTotalPages={typeof data.total_pages === 'number' ? data.total_pages : 1}
          initialTotalResults={totalResults}
          initialSuggestions={suggestions}
          normalizedQuery={data.normalizedQuery}
          appliedQuery={data.appliedQuery}
          usedFallback={data.usedFallback}
          source={data.source}
        />
      </main>

      <EnhancedFooter />
    </div>
  )
}
