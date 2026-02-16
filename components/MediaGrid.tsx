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
  const safeItems = (items || []).filter((i) => i && (i.media_type !== 'person'))
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 xl:gap-6 2xl:gap-7">
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

