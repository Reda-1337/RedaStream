import Header from '@/components/Header'
import EnhancedFooter from '@/components/EnhancedFooter'
import { FEATURED_CHANNELS } from '@/lib/iptv'
import Link from 'next/link'

export const metadata = {
    title: 'Live TV — RedaStream+',
    description: 'Watch free live TV channels from around the world — News, Sports, Entertainment, Science and more.',
}

const CATEGORIES = ['All', 'News', 'Science', 'Documentary', 'Business', 'Entertainment', 'Sports']

export default function LiveTVPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-[#020617]">
            <Header />
            <main className="mx-auto max-w-7xl px-6 pb-16 pt-24">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                        <span className="inline-block w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                        Live TV
                    </h1>
                    <p className="mt-2 text-slate-400">Free live channels from around the world</p>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            className="px-4 py-1.5 rounded-full bg-slate-800 text-slate-300 hover:bg-cyan-500 hover:text-slate-950 transition whitespace-nowrap text-sm font-medium"
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Channel Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {FEATURED_CHANNELS.map((ch, i) => (
                        <Link
                            key={i}
                            href={`/live/watch?url=${encodeURIComponent(ch.streamUrl)}&name=${encodeURIComponent(ch.name)}`}
                            className="group flex flex-col items-center gap-4 p-6 rounded-2xl border border-slate-800/60 bg-slate-900/50 hover:bg-slate-800/70 hover:border-cyan-400/30 transition-all duration-300"
                        >
                            <div className="h-16 w-16 rounded-2xl bg-slate-800/70 flex items-center justify-center overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={ch.logo}
                                    alt={ch.name}
                                    className="h-10 w-auto object-contain"
                                    loading="lazy"
                                />
                            </div>
                            <div className="text-center space-y-2">
                                <span className="text-sm text-white font-semibold group-hover:text-cyan-200 transition-colors">
                                    {ch.name}
                                </span>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/70 text-slate-400">
                                        {ch.category}
                                    </span>
                                    <span className="text-xs text-red-400 flex items-center gap-1">
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                        LIVE
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
            <EnhancedFooter />
        </div>
    )
}
