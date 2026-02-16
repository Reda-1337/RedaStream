import { Suspense } from 'react'
import Header from '@/components/Header'
import EnhancedFooter from '@/components/EnhancedFooter'
import MediaGrid from '@/components/MediaGrid'
import { getMoviesByGenre, MOVIE_GENRES, hasTmdbCredentials } from '@/lib/tmdb'

type Props = {
    params: { id: string }
}

export async function generateMetadata({ params }: Props) {
    const genreId = Number(params.id)
    const genre = MOVIE_GENRES.find((g) => g.id === genreId)
    const name = genre?.name || 'Genre'
    return {
        title: `${name} Movies — RedaStream+`,
        description: `Browse popular ${name.toLowerCase()} movies streaming free on RedaStream+.`,
    }
}

async function GenreResults({ genreId }: { genreId: number }) {
    if (!hasTmdbCredentials()) {
        return <p className="text-slate-400 text-center py-8">TMDB credentials required.</p>
    }
    try {
        const data = await getMoviesByGenre(genreId)
        const items = data.results?.map((item: any) => ({ ...item, media_type: 'movie' })) || []
        if (items.length === 0) {
            return <p className="text-slate-400 text-center py-8">No movies found for this genre.</p>
        }
        return <MediaGrid items={items} />
    } catch {
        return <p className="text-slate-400 text-center py-8">Failed to load genre. Please try again later.</p>
    }
}

export default function GenrePage({ params }: Props) {
    const genreId = Number(params.id)
    const genre = MOVIE_GENRES.find((g) => g.id === genreId)
    const name = genre?.name || 'Genre'

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-[#020617]">
            <Header />
            <main className="mx-auto max-w-7xl px-6 pb-16 pt-24">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white">{name} Movies</h1>
                    <p className="mt-2 text-slate-400">Popular {name.toLowerCase()} movies streaming now</p>
                </div>

                {/* Genre nav */}
                <div className="mb-8 flex flex-wrap gap-2">
                    {MOVIE_GENRES.map((g) => (
                        <a
                            key={g.id}
                            href={`/genre/${g.id}`}
                            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${g.id === genreId
                                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-900/30'
                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                                }`}
                        >
                            {g.name}
                        </a>
                    ))}
                </div>

                <Suspense fallback={
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 xl:gap-6">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div key={i} className="aspect-[2/3] rounded-2xl bg-slate-800/50 animate-pulse" />
                        ))}
                    </div>
                }>
                    <GenreResults genreId={genreId} />
                </Suspense>
            </main>
            <EnhancedFooter />
        </div>
    )
}
