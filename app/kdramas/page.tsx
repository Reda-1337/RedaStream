import { Suspense } from 'react'
import Header from '@/components/Header'
import EnhancedFooter from '@/components/EnhancedFooter'
import MediaGrid from '@/components/MediaGrid'
import { getKDramas, hasTmdbCredentials } from '@/lib/tmdb'

export const metadata = {
    title: 'K-Dramas — RedaStream+',
    description: 'Watch popular Korean dramas streaming free — romance, thriller, comedy and more from South Korea.',
}

const FALLBACK_DATA: any[] = []

async function KDramaResults() {
    if (!hasTmdbCredentials()) {
        return <p className="text-slate-400 text-center py-8">TMDB credentials required to load K-Dramas.</p>
    }
    try {
        const data = await getKDramas()
        const items = data.results?.map((item: any) => ({ ...item, media_type: 'tv' })) || FALLBACK_DATA
        if (items.length === 0) {
            return <p className="text-slate-400 text-center py-8">No K-Dramas found.</p>
        }
        return <MediaGrid items={items} />
    } catch {
        return <p className="text-slate-400 text-center py-8">Failed to load K-Dramas. Please try again later.</p>
    }
}

export default function KDramasPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-[#020617]">
            <Header />
            <main className="mx-auto max-w-7xl px-6 pb-16 pt-24">
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-white">🇰🇷 K-Dramas</h1>
                    <p className="mt-2 text-slate-400">Popular Korean dramas — romance, thriller, comedy & more</p>
                </div>
                <Suspense fallback={
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 xl:gap-6">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div key={i} className="aspect-[2/3] rounded-2xl bg-slate-800/50 animate-pulse" />
                        ))}
                    </div>
                }>
                    <KDramaResults />
                </Suspense>
            </main>
            <EnhancedFooter />
        </div>
    )
}
