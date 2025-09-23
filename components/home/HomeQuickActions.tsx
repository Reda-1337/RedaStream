import Link from "next/link"
import { Film, Tv, Compass, Sparkles, BookmarkPlus } from "lucide-react"

const actions = [
  {
    title: "Movies",
    description: "See what's hot at the box office and on streaming.",
    href: "/movies",
    icon: Film,
    accent: "from-sky-500/30 via-cyan-500/20 to-blue-500/30"
  },
  {
    title: "TV Shows",
    description: "Catch up on trending series and new seasons.",
    href: "/tv",
    icon: Tv,
    accent: "from-violet-500/30 via-purple-500/20 to-indigo-500/30"
  },
  {
    title: "Discover",
    description: "Filter by genre, year, language and more.",
    href: "/search",
    icon: Compass,
    accent: "from-emerald-500/30 via-teal-500/20 to-cyan-500/30"
  },
  {
    title: "Watchlist",
    description: "Build a queue of titles you want to watch later.",
    href: "/profile",
    icon: BookmarkPlus,
    accent: "from-amber-500/30 via-orange-500/20 to-rose-500/30"
  }
] as const

export default function HomeQuickActions() {
  return (
    <section className="mx-auto mt-[-3.5rem] w-full max-w-6xl px-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map(({ title, description, href, icon: Icon, accent }) => (
          <Link
            key={title}
            href={href}
            className="group relative overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-950/80 p-5 transition hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-[0_20px_50px_rgba(6,182,212,0.18)]"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 transition group-hover:opacity-100`} />
            <div className="relative flex flex-col gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/80 text-cyan-200 shadow-[0_12px_25px_rgba(6,182,212,0.22)]">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              <p className="text-sm text-slate-300">{description}</p>
              <span className="mt-1 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200">
                Explore
                <Sparkles className="h-3 w-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
