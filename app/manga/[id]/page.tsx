import Header from '@/components/Header'
import EnhancedFooter from '@/components/EnhancedFooter'
import { getMangaById } from '@/lib/kitsu'
import Image from 'next/image'
import Link from 'next/link'

type Props = { params: { id: string } }

export async function generateMetadata({ params }: Props) {
    try {
        const { data: manga } = await getMangaById(params.id)
        const title = manga.attributes.titles?.en || manga.attributes.canonicalTitle || 'Manga'
        return {
            title: `${title} — RedaStream+`,
            description: manga.attributes.synopsis?.slice(0, 160) || `Read ${title} on RedaStream+`,
        }
    } catch {
        return { title: 'Manga — RedaStream+' }
    }
}

export default async function MangaDetailPage({ params }: Props) {
    let manga: any = null
    try {
        const res = await getMangaById(params.id)
        manga = res.data
    } catch {
        // will render error state
    }

    if (!manga) {
        return (
            <div className="min-h-screen bg-slate-950">
                <Header />
                <main className="mx-auto max-w-7xl px-6 pb-16 pt-24 text-center">
                    <p className="text-slate-400 text-lg">Manga not found.</p>
                    <Link href="/manga" className="mt-4 inline-block text-cyan-400 hover:text-cyan-300">← Back to Manga</Link>
                </main>
                <EnhancedFooter />
            </div>
        )
    }

    const attrs = manga.attributes
    const title = attrs.titles?.en || attrs.titles?.en_jp || attrs.canonicalTitle
    const poster = attrs.posterImage?.large || attrs.posterImage?.medium
    const cover = attrs.coverImage?.large || attrs.coverImage?.original
    const rating = attrs.averageRating ? (Number(attrs.averageRating) / 10).toFixed(1) : null

    return (
        <div className="min-h-screen bg-slate-950">
            <Header />

            <section className="relative">
                <div className="absolute inset-0">
                    {cover ? (
                        <Image src={cover} alt={title} fill priority className="object-cover" />
                    ) : (
                        <div className="h-full w-full bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent" />
                </div>

                <div className="relative mx-auto w-full max-w-7xl px-6 pb-20 pt-24">
                    <div className="flex flex-col gap-10 lg:flex-row">
                        {/* Poster */}
                        <aside className="w-full max-w-sm space-y-6">
                            <div className="overflow-hidden rounded-[28px] border border-slate-800/60 shadow-[0_25px_60px_rgba(8,47,73,0.45)]">
                                <div className="relative aspect-[2/3]">
                                    {poster ? (
                                        <Image src={poster} alt={title} fill className="object-cover" priority />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-slate-800 text-slate-500">No Cover</div>
                                    )}
                                </div>
                            </div>
                        </aside>

                        {/* Info */}
                        <div className="flex-1 space-y-6">
                            <div>
                                <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">Manga</p>
                                <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">{title}</h1>
                            </div>

                            <div className="flex flex-wrap gap-3 text-sm text-slate-300">
                                {rating && (
                                    <span className="rounded-full bg-slate-900/70 px-4 py-1.5 text-amber-300 font-semibold">
                                        ⭐ {rating}
                                    </span>
                                )}
                                {attrs.status && (
                                    <span className="rounded-full bg-slate-900/70 px-4 py-1.5 capitalize">{attrs.status}</span>
                                )}
                                {attrs.subtype && (
                                    <span className="rounded-full bg-slate-900/70 px-4 py-1.5 capitalize">{attrs.subtype}</span>
                                )}
                                {attrs.chapterCount && (
                                    <span className="rounded-full bg-slate-900/70 px-4 py-1.5">{attrs.chapterCount} Chapters</span>
                                )}
                                {attrs.volumeCount && (
                                    <span className="rounded-full bg-slate-900/70 px-4 py-1.5">{attrs.volumeCount} Volumes</span>
                                )}
                                {attrs.startDate && (
                                    <span className="rounded-full bg-slate-900/70 px-4 py-1.5">{attrs.startDate.slice(0, 4)}</span>
                                )}
                            </div>

                            {attrs.synopsis && (
                                <p className="max-w-3xl text-sm text-slate-300 md:text-base md:leading-relaxed">
                                    {attrs.synopsis}
                                </p>
                            )}

                            <div className="rounded-2xl border border-slate-800/60 bg-slate-950/70 p-5">
                                <p className="text-sm text-slate-400">
                                    📖 Manga reading is not directly available on RedaStream+. You can use external readers like{' '}
                                    <a href="https://mangadex.org" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline">
                                        MangaDex
                                    </a>{' '}
                                    or{' '}
                                    <a href="https://mangaplus.shueisha.co.jp" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline">
                                        MANGA Plus
                                    </a>{' '}
                                    to read this title.
                                </p>
                            </div>

                            <Link
                                href="/manga"
                                className="inline-flex items-center rounded-full border border-slate-700/60 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/60 hover:text-white"
                            >
                                ← Back to Manga
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <EnhancedFooter />
        </div>
    )
}
