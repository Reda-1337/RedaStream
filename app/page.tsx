import Header from '@/components/Header'
import EnhancedFooter from '@/components/EnhancedFooter'
import EnhancedHeroSection from '@/components/EnhancedHeroSection'
import ContentSection from '@/components/ContentSection'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import ErrorBoundary from '@/components/ErrorBoundary'
import { getBaseUrl } from '@/lib/baseUrl'
import { Suspense } from 'react'
import {
  FALLBACK_MOVIES,
  FALLBACK_TRENDING,
  FALLBACK_TV,
  FALLBACK_UPCOMING
} from '@/components/home/fallbackData'

async function getTrending() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/trending?media_type=all&time_window=week`, {
      next: { revalidate: Number(process.env.CACHE_TTL_SECONDS || 300) }
    })
    if (!res.ok) throw new Error(`Trending API failed: ${res.status}`)
    return res.json()
  } catch (error) {
    console.error('Error fetching trending data:', error)
    return { results: [] as any[] }
  }
}

async function getPopularMovies() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/discover?type=movie&sort_by=popularity.desc&page=1`, {
      next: { revalidate: Number(process.env.CACHE_TTL_SECONDS || 300) }
    })
    if (!res.ok) throw new Error(`Popular Movies API failed: ${res.status}`)
    return res.json()
  } catch (error) {
    console.error('Error fetching popular movies:', error)
    return { results: [] as any[] }
  }
}

async function getPopularTV() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/discover?type=tv&sort_by=popularity.desc&page=1`, {
      next: { revalidate: Number(process.env.CACHE_TTL_SECONDS || 300) }
    })
    if (!res.ok) throw new Error(`Popular TV API failed: ${res.status}`)
    return res.json()
  } catch (error) {
    console.error('Error fetching popular TV:', error)
    return { results: [] as any[] }
  }
}

async function getTopRatedMovies() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/discover?type=movie&sort_by=vote_average.desc&page=1`, {
      next: { revalidate: Number(process.env.CACHE_TTL_SECONDS || 300) }
    })
    if (!res.ok) throw new Error(`Top Rated Movies API failed: ${res.status}`)
    return res.json()
  } catch (error) {
    console.error('Error fetching top rated movies:', error)
    return { results: [] as any[] }
  }
}

async function getTopRatedTV() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/discover?type=tv&sort_by=vote_average.desc&page=1`, {
      next: { revalidate: Number(process.env.CACHE_TTL_SECONDS || 300) }
    })
    if (!res.ok) throw new Error(`Top Rated TV API failed: ${res.status}`)
    return res.json()
  } catch (error) {
    console.error('Error fetching top rated TV:', error)
    return { results: [] as any[] }
  }
}

async function getUpcomingMovies() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/discover?type=movie&sort_by=release_date.desc&page=1`, {
      next: { revalidate: Number(process.env.CACHE_TTL_SECONDS || 300) }
    })
    if (!res.ok) throw new Error(`Upcoming Movies API failed: ${res.status}`)
    return res.json()
  } catch (error) {
    console.error('Error fetching upcoming movies:', error)
    return { results: [] as any[] }
  }
}

function withFallback<T extends { results?: any[] }>(data: T | null | undefined, fallback: any[]) {
  if (!data || !Array.isArray(data.results) || data.results.length === 0) {
    return fallback
  }
  return data.results
}

export default async function HomePage() {
  const [trendingData, popularMoviesData, popularTVData, topRatedMoviesData, topRatedTVData, upcomingMoviesData] = await Promise.all([
    getTrending(),
    getPopularMovies(),
    getPopularTV(),
    getTopRatedMovies(),
    getTopRatedTV(),
    getUpcomingMovies()
  ])

  const trendingItems = withFallback(trendingData, FALLBACK_TRENDING)
  const popularMovies = withFallback(popularMoviesData, FALLBACK_MOVIES)
  const popularTV = withFallback(popularTVData, FALLBACK_TV)
  const topRatedMovies = withFallback(topRatedMoviesData, FALLBACK_MOVIES)
  const topRatedTV = withFallback(topRatedTVData, FALLBACK_TV)
  const upcomingMovies = withFallback(upcomingMoviesData, FALLBACK_UPCOMING)

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <Header />

      <main className="relative">
        <Suspense fallback={<LoadingSkeleton type="hero" />}>
          <div id="hero-section">
            <EnhancedHeroSection items={trendingItems} />
          </div>
        </Suspense>

        <div className="space-y-16 pb-20">
          <ErrorBoundary fallback={<div className="py-8 text-center text-gray-400">Failed to load trending content</div>}>
            <ContentSection
              sectionId="trending-section"
              title="Trending Now"
              subtitle="Most watched across movies and TV this week."
              icon="TN"
              items={trendingItems.slice(0, 20)}
              viewAllHref="/"
            />
          </ErrorBoundary>

          <ErrorBoundary fallback={<div className="py-8 text-center text-gray-400">Failed to load popular movies</div>}>
            <ContentSection
              sectionId="popular-movies-section"
              title="Popular Movies"
              subtitle="Fan favourites heating up right now."
              icon="PM"
              items={popularMovies.slice(0, 20)}
              viewAllHref="/movies"
            />
          </ErrorBoundary>

          <ErrorBoundary fallback={<div className="py-8 text-center text-gray-400">Failed to load popular TV shows</div>}>
            <ContentSection
              sectionId="popular-tv-section"
              title="Popular TV Shows"
              subtitle="Series viewers keep returning to."
              icon="TV"
              items={popularTV.slice(0, 20)}
              viewAllHref="/tv"
            />
          </ErrorBoundary>

          <ErrorBoundary fallback={<div className="py-8 text-center text-gray-400">Failed to load top rated movies</div>}>
            <ContentSection
              sectionId="top-rated-movies-section"
              title="Top Rated Movies"
              subtitle="Critic-approved films worth your time."
              icon="TR"
              items={topRatedMovies.slice(0, 20)}
              viewAllHref="/movies?sort=rating"
            />
          </ErrorBoundary>

          <ErrorBoundary fallback={<div className="py-8 text-center text-gray-400">Failed to load top rated TV shows</div>}>
            <ContentSection
              sectionId="top-rated-tv-section"
              title="Top Rated TV Shows"
              subtitle="Acclaimed series with standout seasons."
              icon="AT"
              items={topRatedTV.slice(0, 20)}
              viewAllHref="/tv?sort=rating"
            />
          </ErrorBoundary>

          <ErrorBoundary fallback={<div className="py-8 text-center text-gray-400">Failed to load upcoming movies</div>}>
            <ContentSection
              sectionId="coming-soon-section"
              title="Coming Soon"
              subtitle="Set reminders for the next wave of releases."
              icon="CS"
              items={upcomingMovies.slice(0, 20)}
              viewAllHref="/movies?sort=upcoming"
            />
          </ErrorBoundary>
        </div>
      </main>

      <EnhancedFooter />
    </div>
  )
}
