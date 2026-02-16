'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const PROVIDERS = [
    { id: 8, name: 'Netflix', icon: '🔴', color: 'bg-red-700' },
    { id: 9, name: 'Prime', icon: '🔵', color: 'bg-blue-700' },
    { id: 384, name: 'Max', icon: '🟣', color: 'bg-purple-700' },
    { id: 337, name: 'Disney+', icon: '🏰', color: 'bg-blue-900' },
    { id: 350, name: 'Apple TV+', icon: '🍎', color: 'bg-slate-700' },
    { id: 531, name: 'Paramount+', icon: '⭐', color: 'bg-indigo-700' },
] as const

export default function ProviderFilter() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const activeId = searchParams.get('with_watch_providers')
        ? Number(searchParams.get('with_watch_providers'))
        : null

    const setProvider = (id: number | null) => {
        const params = new URLSearchParams(searchParams.toString())
        if (id === null) {
            params.delete('with_watch_providers')
            params.delete('watch_region')
        } else {
            params.set('with_watch_providers', String(id))
            params.set('watch_region', 'US')
        }
        params.delete('page')
        router.push(`?${params.toString()}`)
    }

    return (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            <button
                onClick={() => setProvider(null)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all
          ${activeId === null
                        ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
            >
                All Platforms
            </button>
            {PROVIDERS.map((p) => (
                <button
                    key={p.id}
                    onClick={() => setProvider(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5
            ${activeId === p.id
                            ? `${p.color} text-white shadow-lg shadow-black/30`
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                >
                    {p.icon} {p.name}
                </button>
            ))}
        </div>
    )
}
