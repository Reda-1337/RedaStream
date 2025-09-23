"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Star, Info, ChevronLeft, ChevronRight, Pause, Volume2, VolumeX, Heart, Share2 } from 'lucide-react'

type HeroItem = {
  id: number
  title?: string
  name?: string
  overview?: string
  backdrop_path?: string | null
  poster_path?: string | null
  release_date?: string
  first_air_date?: string
  vote_average?: number
  media_type?: 'movie' | 'tv'
}

type Props = {
  items: HeroItem[]
}

const AUTO_DELAY = 6500

const FALLBACK_ITEMS: HeroItem[] = [
  {
    id: 900001,
    title: 'Gen V',
    overview:
      "At America's only college for superheroes, gifted students test their moral boundaries to join The Seven. When dark secrets surface, they must decide what kind of heroes they want to be.",
    backdrop_path: '/mrIw6h14GZwdUuY2ZSP91rlqmK3.jpg',
    release_date: '2023-09-29',
    vote_average: 7.7,
    media_type: 'tv'
  },
  {
    id: 900002,
    title: 'Dune: Part Two',
    overview:
      'Paul Atreides unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.',
    backdrop_path: '/1Z1Z1g9XxZMEYqgkZ7Z2u7FZ3FD.jpg',
    release_date: '2024-03-01',
    vote_average: 8.3,
    media_type: 'movie'
  },
  {
    id: 900003,
    title: 'Avatar: The Way of Water',
    overview:
      'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. When an old threat returns, Jake must work with Neytiri and the army of the Na’vi to protect their home.',
    backdrop_path: '/sAhP3LlD2t0VAnf8seTzQIx75y3.jpg',
    release_date: '2022-12-14',
    vote_average: 7.6,
    media_type: 'movie'
  }
]

export default function EnhancedHeroSection({ items }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  const heroItems = useMemo(() => {
    const normalized = items.slice(0, 6)
    if (normalized.length > 1) return normalized
    if (normalized.length === 1) return [...normalized, ...FALLBACK_ITEMS]
    return FALLBACK_ITEMS
  }, [items])
  const hasMultipleItems = heroItems.length > 1

  const clearAutoTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const scheduleNextSlide = useCallback(() => {
    clearAutoTimer()
    if (!isAutoPlaying || !hasMultipleItems || isHovered) return
    timeoutRef.current = window.setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % heroItems.length)
    }, AUTO_DELAY)
  }, [clearAutoTimer, heroItems.length, hasMultipleItems, isAutoPlaying, isHovered])

  useEffect(() => {
    setCurrentIndex(0)
    setIsFavorited(false)
    setIsAutoPlaying(true)
  }, [heroItems])

  useEffect(() => {
    scheduleNextSlide()
    return clearAutoTimer
  }, [currentIndex, scheduleNextSlide, clearAutoTimer])

  useEffect(() => {
    scheduleNextSlide()
    return clearAutoTimer
  }, [isAutoPlaying, hasMultipleItems, isHovered, scheduleNextSlide, clearAutoTimer])

  useEffect(() => clearAutoTimer, [clearAutoTimer])

  useEffect(() => {
    if (currentIndex >= heroItems.length && heroItems.length > 0) {
      setCurrentIndex(0)
    }
  }, [currentIndex, heroItems.length])

  const goToPrevious = useCallback(() => {
    if (!hasMultipleItems) return
    setCurrentIndex((prev) => (prev - 1 + heroItems.length) % heroItems.length)
  }, [heroItems.length, hasMultipleItems])

  const goToNext = useCallback(() => {
    if (!hasMultipleItems) return
    setCurrentIndex((prev) => (prev + 1) % heroItems.length)
  }, [heroItems.length, hasMultipleItems])

  const goToSlide = useCallback((index: number) => {
    if (!hasMultipleItems) return
    setCurrentIndex(index)
  }, [hasMultipleItems])

  const toggleAutoPlay = () => setIsAutoPlaying((prev) => !prev)
  const toggleMute = () => setIsMuted((prev) => !prev)
  const toggleFavorite = () => setIsFavorited((prev) => !prev)

  const currentItem = heroItems[currentIndex]
  const title = currentItem.title || currentItem.name || 'Untitled'
  const date = currentItem.release_date || currentItem.first_air_date
  const year = date ? date.slice(0, 4) : ''
  const mediaType = currentItem.media_type || (currentItem.name ? 'tv' : 'movie')
  const rating = typeof currentItem.vote_average === 'number' ? currentItem.vote_average.toFixed(1) : 'N/A'
  const watchHref = mediaType === 'movie' ? `/watch/movie/${currentItem.id}` : `/watch/tv/${currentItem.id}/1/1`

  return (
    <section
      className="relative min-h-[60vh] overflow-hidden rounded-[24px] border border-slate-800/50 shadow-[0_40px_120px_rgba(8,47,73,0.55)] sm:min-h-[65vh] lg:min-h-[75vh] lg:rounded-[32px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0">
        {currentItem.backdrop_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/original${currentItem.backdrop_path}`}
            alt={title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 70vw"
            onError={(event) => {
              const target = event.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/40 to-transparent" />
        <div className="absolute inset-y-0 left-0 right-1/2 bg-[radial-gradient(circle_at_left,_rgba(14,165,233,0.35),_transparent_65%)]" />
      </div>

      {hasMultipleItems && (
        <>
          <button
            type="button"
            onClick={goToPrevious}
            aria-label="Previous item"
            className="absolute left-3 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white shadow-lg backdrop-blur transition hover:bg-black/60 sm:flex"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={goToNext}
            aria-label="Next item"
            className="absolute right-3 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white shadow-lg backdrop-blur transition hover:bg-black/60 sm:flex"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <div className="relative z-10 flex h-full items-center">
        <div className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-10 lg:pb-14">
          <div className="max-w-3xl space-y-5 text-white sm:space-y-6">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold sm:gap-3 sm:text-sm">
              {rating !== 'N/A' && (
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-500/90 px-3 py-1.5 text-slate-900 shadow sm:px-4">
                  <Star className="h-4 w-4" />
                  {rating}
                </span>
              )}
              {year && <span className="rounded-full bg-white/15 px-3 py-1.5 text-white/90 sm:px-4">{year}</span>}
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-white/80 capitalize sm:px-4">
                {mediaType === 'movie' ? 'Movie' : 'TV Series'}
              </span>
            </div>

            <h1 className="text-3xl font-bold drop-shadow-lg sm:text-4xl md:text-5xl lg:text-6xl">{title}</h1>

            {currentItem.overview && (
              <p className="text-sm leading-relaxed text-white/80 sm:text-base lg:text-lg">
                {currentItem.overview}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Link
                href={watchHref as any}
                className="inline-flex items-center gap-2 rounded-full bg-sky-400 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_20px_45px_rgba(14,165,233,0.45)] transition hover:-translate-y-0.5 hover:bg-sky-300 sm:px-8 sm:py-3"
              >
                <Play className="h-5 w-5" />
                Watch Now
              </Link>

              <button
                type="button"
                onClick={toggleFavorite}
                className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition sm:px-6 sm:py-3 ${
                  isFavorited
                    ? 'border-rose-500 bg-rose-500/15 text-rose-200'
                    : 'border-white/20 bg-white/5 text-white/90 hover:border-sky-400/70 hover:text-white'
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
                Watchlist
              </button>

              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:border-sky-400/70 hover:text-white sm:h-12 sm:w-12"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:border-sky-400/70 hover:text-white sm:h-12 sm:w-12"
              >
                <Info className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 sm:bottom-6 sm:right-6">
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute trailer' : 'Mute trailer'}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition hover:border-sky-400/70 sm:h-10 sm:w-10"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={toggleAutoPlay}
          aria-label={isAutoPlaying ? 'Pause carousel' : 'Play carousel'}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition hover:border-sky-400/70 sm:h-10 sm:w-10"
        >
          {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
      </div>

      {hasMultipleItems && (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:bottom-6">
          {heroItems.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2 w-2 rounded-full transition-all duration-300 sm:h-2.5 sm:w-2.5 ${
                index === currentIndex ? 'w-5 bg-sky-400 sm:w-6' : 'bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
