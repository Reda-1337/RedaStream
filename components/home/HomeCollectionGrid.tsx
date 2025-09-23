import Link from "next/link"
import { CalendarRange, Clapperboard, FlameKindling, Sparkles } from "lucide-react"

const collections = [
  {
    title: 'Tonight on Streaming',
    description: 'Fresh episodes airing this week across popular platforms.',
    href: '/tv?sort=airing',
    icon: CalendarRange
  },
  {
    title: 'Award Winners',
    description: 'Critically acclaimed films with stellar reviews.',
    href: '/movies?sort=rating&vote_count.gte=500',
    icon: Sparkles
  },
  {
    title: 'Family Movie Night',
    description: 'Animated adventures and heartwarming stories for everyone.',
    href: '/movies?with_genres=16,10751',
    icon: Clapperboard
  },
  {
    title: 'Weekend Binge',
    description: 'Completed series you can finish in a single weekend.',
    href: '/tv?sort=popularity.desc&with_runtime.lte=45',
    icon: FlameKindling
  }
] as const

export default function HomeCollectionGrid() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6">
      <div className="rounded-[32px] border border-slate-800/60 bg-slate-950/80 p-8 shadow-[0_25px_70px_rgba(8,47,73,0.35)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">Curated For You</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Quick picks to start watching faster</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Jump straight into a mood-based collection—whether you want something new tonight or a weekend binge list.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {collections.map(({ title, description, href, icon: Icon }) => (
            <Link
              key={title}
              href={href}
              prefetch={false}
              className="group relative overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-950/70 p-6 transition hover:-translate-y-1 hover:border-cyan-400/50 hover:shadow-[0_22px_60px_rgba(6,182,212,0.25)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="relative flex flex-col gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/80 text-cyan-200">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="text-sm text-slate-300">{description}</p>
                <span className="mt-1 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200">
                  Browse collection
                  <span aria-hidden className="text-cyan-300">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
