"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Star, Calendar, Film, Tv } from 'lucide-react'

type Props = {
    id: number
    title: string
    overview?: string
    posterPath: string | null
    backdropPath?: string | null
    year?: string
    rating?: number
    mediaType: 'movie' | 'tv'
}

const FALLBACK_POSTER =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="750">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#020617"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#334155" font-family="Inter, Arial" font-size="32">RedaStream+</text>
    </svg>
  `)

export default function SearchItemCard({
    id,
    title,
    overview,
    posterPath,
    year,
    rating,
    mediaType
}: Props) {
    const posterSrc = posterPath
        ? `https://image.tmdb.org/t/p/w500${posterPath}`
        : FALLBACK_POSTER

    const detailHref = mediaType === 'movie' ? `/movie/${id}` : `/tv/${id}`
    const isMovie = mediaType === 'movie'

    return (
        <Link
            href={detailHref}
            className="group relative flex w-full overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/60 transition-all duration-300 hover:border-cyan-500/30 hover:bg-slate-800/80 hover:shadow-[0_8px_30px_rgba(8,145,178,0.1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80"
        >
            {/* Poster Image */}
            <div className="relative h-32 w-24 flex-shrink-0 sm:h-48 sm:w-32 md:h-56 md:w-40">
                <Image
                    src={posterSrc}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, 160px"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-slate-950/10" />
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col justify-between p-3 sm:p-4 md:p-6">
                <div className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                        <h3 className="line-clamp-1 text-base font-bold text-white transition-colors group-hover:text-cyan-200 sm:text-lg md:text-xl md:line-clamp-2">
                            {title}
                        </h3>
                        {rating && rating > 0 && (
                            <div className="hidden flex-shrink-0 items-center gap-1 rounded-full bg-slate-950/60 px-2 py-1 text-xs font-semibold text-amber-300 ring-1 ring-slate-800 sm:flex">
                                <Star className="h-3.5 w-3.5 fill-current" />
                                <span>{rating.toFixed(1)}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 sm:text-sm">
                        <div className="flex items-center gap-1.5">
                            {isMovie ? <Film className="h-3.5 w-3.5" /> : <Tv className="h-3.5 w-3.5" />}
                            <span className="capitalize">{mediaType === 'movie' ? 'Movie' : 'TV Series'}</span>
                        </div>
                        {year && (
                            <>
                                <span className="h-1 w-1 rounded-full bg-slate-700" />
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>{year}</span>
                                </div>
                            </>
                        )}
                        {rating && rating > 0 && (
                            <div className="flex items-center gap-1 sm:hidden text-amber-300">
                                <Star className="h-3 w-3 fill-current" />
                                <span>{rating.toFixed(1)}</span>
                            </div>
                        )}
                    </div>

                    {overview && (
                        <p className="line-clamp-2 text-xs text-slate-400 sm:text-sm sm:line-clamp-3 md:mt-3 md:text-slate-300">
                            {overview}
                        </p>
                    )}
                </div>

                <div className="mt-3 flex items-center gap-2 sm:mt-0">
                    <span className="text-xs font-medium text-cyan-400 opacity-0 transition-opacity group-hover:opacity-100 sm:text-sm">
                        View Details →
                    </span>
                </div>
            </div>
        </Link>
    )
}
