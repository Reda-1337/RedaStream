import Header from '@/components/Header'
import EnhancedFooter from '@/components/EnhancedFooter'
import EnhancedHeroSection from '@/components/EnhancedHeroSection'
import ContentSection from '@/components/ContentSection'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import ErrorBoundary from '@/components/ErrorBoundary'
import { tmdbFetch } from '@/lib/tmdb'
import { Suspense } from 'react'
import {
  FALLBACK_MOVIES,
  FALLBACK_TRENDING,
  FALLBACK_TV,
  FALLBACK_UPCOMING
} from '@/components/home/fallbackData'

const HAS_TMDB_CREDS = Boolean(process.env.TMDB_API_KEY || process.env.TMDB_READ_TOKEN)

async function getTrending() {
  if (!HAS_TMDB_CREDS) return { results: FALLBACK_TRENDING }
  try {
    return await tmdbFetch<{ results?: any[] }>('/trending/all/week', { page: '1' })
  } catch (error) {
    console.error('Error fetching trending data:', error)
    return { results: FALLBACK_TRENDING }
  }
}

async function getPopularMovies() {
  if (!HAS_TMDB_CREDS) return { results: FALLBACK_MOVIES }
  try {
    return await tmdbFetch<{ results?: any[] }>('/discover/movie', {
      sort_by: 'popularity.desc',
      page: '1'
    })
  } catch (error) {
    console.error('Error fetching popular movies:', error)
    return { results: FALLBACK_MOVIES }
  }
}

async function getPopularTV() {
  if (!HAS_TMDB_CREDS) return { results: FALLBACK_TV }
  try {
    return await tmdbFetch<{ results?: any[] }>('/discover/tv', {
      sort_by: 'popularity.desc',
      page: '1'
    })
  } catch (error) {
    console.error('Error fetching popular TV:', error)
    return { results: FALLBACK_TV }
  }
}

async function getTopRatedMovies() {
  if (!HAS_TMDB_CREDS) return { results: FALLBACK_MOVIES }
  try {
    return await tmdbFetch<{ results?: any[] }>('/discover/movie', {
      sort_by: 'vote_average.desc',
      page: '1',
      'vote_count.gte': '200'
    })
  } catch (error) {
    console.error('Error fetching top rated movies:', error)
    return { results: FALLBACK_MOVIES }
  }
}

async function getTopRatedTV() {
  if (!HAS_TMDB_CREDS) return { results: FALLBACK_TV }
  try {
    return await tmdbFetch<{ results?: any[] }>('/discover/tv', {
      sort_by: 'vote_average.desc',
      page: '1',
      'vote_count.gte': '200'
    })
  } catch (error) {
    console.error('Error fetching top rated TV:', error)
    return { results: FALLBACK_TV }
  }
}

async function getUpcomingMovies() {
  if (!HAS_TMDB_CREDS) return { results: FALLBACK_UPCOMING }
  try {
    return await tmdbFetch<{ results?: any[] }>('/discover/movie', {
      sort_by: 'primary_release_date.asc',
      page: '1',
      'primary_release_date.gte': new Date().toISOString().slice(0, 10)
    })
  } catch (error) {
    console.error('Error fetching upcoming movies:', error)
    return { results: FALLBACK_UPCOMING }
  }
}

function unwrapResults<T extends { results?: any[] }>(data: T | null | undefined) {
  if (!data || !Array.isArray(data.results)) return []
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

  const trendingItems = unwrapResults(trendingData)
  const popularMovies = unwrapResults(popularMoviesData)
  const popularTV = unwrapResults(popularTVData)
  const topRatedMovies = unwrapResults(topRatedMoviesData)
  const topRatedTV = unwrapResults(topRatedTVData)
  const upcomingMovies = unwrapResults(upcomingMoviesData)

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


