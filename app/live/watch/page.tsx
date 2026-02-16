import Header from '@/components/Header'
import EnhancedFooter from '@/components/EnhancedFooter'
import IPTVPlayer from '@/components/IPTVPlayer'
import Link from 'next/link'

type Props = {
    searchParams: { url?: string; name?: string }
}

export function generateMetadata({ searchParams }: Props) {
    const name = searchParams.name ? decodeURIComponent(searchParams.name) : 'Live TV'
    return {
        title: `${name} — Live TV — RedaStream+`,
        description: `Watch ${name} live on RedaStream+`,
    }
}

export default function LiveWatchPage({ searchParams }: Props) {
    const streamUrl = searchParams.url ? decodeURIComponent(searchParams.url) : ''
    const channelName = searchParams.name ? decodeURIComponent(searchParams.name) : 'Unknown Channel'

    if (!streamUrl) {
        return (
            <div className="min-h-screen bg-slate-950">
                <Header />
                <main className="mx-auto max-w-7xl px-6 pb-16 pt-24 text-center">
                    <p className="text-slate-400 text-lg">No stream URL provided.</p>
                    <Link href="/live" className="mt-4 inline-block text-cyan-400 hover:text-cyan-300">← Back to Live TV</Link>
                </main>
                <EnhancedFooter />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <Header />
            <main className="mx-auto max-w-7xl px-6 pb-16 pt-24">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                        {channelName}
                    </h1>
                    <Link
                        href="/live"
                        className="inline-flex items-center rounded-full border border-slate-700/60 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/60 hover:text-white"
                    >
                        ← All Channels
                    </Link>
                </div>
                <IPTVPlayer streamUrl={streamUrl} channelName={channelName} />
            </main>
            <EnhancedFooter />
        </div>
    )
}
