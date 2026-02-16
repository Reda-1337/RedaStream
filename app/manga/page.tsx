import Header from '@/components/Header'
import EnhancedFooter from '@/components/EnhancedFooter'
import { getMangaPopular, type KitsuManga } from '@/lib/kitsu'
import Image from 'next/image'
import Link from 'next/link'

export const metadata = {
    title: 'Manga — RedaStream+',
    description: 'Browse popular manga — one piece, naruto, attack on titan and more from Kitsu.io.',
}

function MangaCard({ manga }: { manga: KitsuManga }) {
    const attrs = manga.attributes
    const poster = attrs.posterImage?.medium || attrs.posterImage?.small
    const title = attrs.titles?.en || attrs.titles?.en_jp || attrs.canonicalTitle || attrs.slug
    const rating = attrs.averageRating ? (Number(attrs.averageRating) / 10).toFixed(1) : null

    return (
        <Link
            href={`/manga/${manga.id}`}
            className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80"
        >
            <div className="overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_45px_rgba(8,47,73,0.45)]">
                <div className="relative aspect-[2/3] overflow-hidden">
                    {poster ? (
                        <Image
                            src={poster}
                            alt={title}
                            fill
                            sizes="(max-width:768px) 50vw, (max-width:1200px) 20vw, 18vw"
                            className="object-cover transition-all duration-500 group-hover:scale-110"
                            loading="lazy"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-800 text-slate-500 text-sm">No Cover</div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                    {rating && (
                        <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur">
                            ⭐ {rating}
                        </div>
                    )}

                    <div className="absolute bottom-3 left-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-slate-300/80">
                        <span className="rounded-full bg-slate-950/80 px-2 py-1 backdrop-blur">
                            {attrs.subtype || 'Manga'}
                        </span>
                        {attrs.status && (
                            <span className="rounded-full bg-slate-950/60 px-2 py-1 backdrop-blur">{attrs.status}</span>
                        )}
                    </div>

                    <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/90 text-slate-950 shadow-[0_12px_30px_rgba(6,182,212,0.45)] text-lg">
                                📖
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-1 px-4 pb-4 pt-3">
                    <h3 className="line-clamp-2 text-sm font-semibold text-white transition-colors duration-200 group-hover:text-cyan-200">
                        {title}
                    </h3>
                    {attrs.chapterCount && (
                        <p className="text-xs text-slate-400">{attrs.chapterCount} chapters</p>
                    )}
                </div>
            </div>
        </Link>
    )
}

export default async function MangaPage() {
    let mangaList: KitsuManga[] = []
    let error = false

    try {
        const data = await getMangaPopular()
        mangaList = data.data || []
    } catch {
        error = true
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-[#020617]">
            <Header />
            <main className="mx-auto max-w-7xl px-6 pb-16 pt-24">
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-white">📚 Manga</h1>
                    <p className="mt-2 text-slate-400">Popular manga series from Kitsu.io — browse covers, synopses & more</p>
                </div>

                {error ? (
                    <p className="text-slate-400 text-center py-8">Failed to load manga. Please try again later.</p>
                ) : mangaList.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No manga found.</p>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 xl:gap-6">
                        {mangaList.map((manga) => (
                            <MangaCard key={manga.id} manga={manga} />
                        ))}
                    </div>
                )}
            </main>
            <EnhancedFooter />
        </div>
    )
}
