"use client"

import Image from 'next/image'
import Link from 'next/link'
import { Play } from 'lucide-react'

type Props = {
  id: number
  title: string
  posterPath: string | null
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

export default function MediaCard({ id, title, posterPath, year, rating, mediaType }: Props) {
  const posterSrc = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : FALLBACK_POSTER

  const detailHref = mediaType === 'movie' ? `/movie/${id}` : `/tv/${id}`

  return (
    <Link
      href={detailHref as any}
      className="group block rounded-2xl focus-ring focus-visible:scale-105"
    >
      <div className="glass-card overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_45px_rgba(8,47,73,0.45)] group-focus-visible:shadow-[0_0_0_4px_rgba(34,211,238,0.4)]">
        <div className="relative aspect-[2/3] overflow-hidden">
          <Image
            src={posterSrc}
            alt={title}
            fill
            sizes="(max-width:768px) 50vw, (max-width:1200px) 20vw, (max-width:1600px) 18vw, 14vw"
            className="object-cover transition-all duration-500 group-hover:scale-110"
            priority={false}
            onError={(event) => {
              const target = event.target as HTMLImageElement
              target.src = FALLBACK_POSTER
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

          {typeof rating === 'number' && rating > 0 && (
            <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur">
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z" />
              </svg>
              {rating.toFixed(1)}
            </div>
          )}

          <div className="absolute bottom-3 left-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-slate-300/80">
            <span className="rounded-full bg-slate-950/80 px-2 py-1 backdrop-blur">
              {mediaType === 'movie' ? 'Movie' : 'TV'}
            </span>
            {year && <span className="rounded-full bg-slate-950/60 px-2 py-1 backdrop-blur">{year}</span>}
          </div>

          <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/90 text-slate-950 shadow-[0_12px_30px_rgba(6,182,212,0.45)]">
                <Play className="h-5 w-5" />
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 px-4 pb-4 pt-3">
          <h3 className="line-clamp-2 text-sm font-semibold text-white transition-colors duration-200 group-hover:text-cyan-200 2xl:text-base">
            {title}
          </h3>
        </div>
      </div>
    </Link>
  )
}

