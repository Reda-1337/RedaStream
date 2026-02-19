import MediaCard from './MediaCard'

type Item = {
  id: number
  title?: string
  name?: string
  poster_path?: string | null
  release_date?: string
  first_air_date?: string
  vote_average?: number
  media_type?: 'movie' | 'tv' | 'person'
}

export default function MediaGrid({ items }: { items: Item[] }) {
  const safeItems = (items || []).filter((i) => i && i.media_type !== 'person')

  if (safeItems.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 px-4 py-8 text-center text-sm text-slate-400">
        No titles found for this section yet.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-1 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 xl:gap-6 2xl:gap-8">
      {safeItems.map((item) => {
        const title = item.title || item.name || 'Untitled'
        const date = item.release_date || item.first_air_date || ''
        const year = date ? date.slice(0, 4) : undefined
        const mediaType = (item.media_type || (item.first_air_date ? 'tv' : 'movie')) as 'movie' | 'tv'

        return (
          <MediaCard
            key={`${mediaType}-${item.id}`}
            id={item.id}
            title={title}
            posterPath={item.poster_path || null}
            year={year}
            rating={item.vote_average}
            mediaType={mediaType}
          />
        )
      })}
    </div>
  )
}