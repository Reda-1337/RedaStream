"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, type FormEvent } from "react"
import { Film, Home, Layers, Search, User, Bell, Settings } from "lucide-react"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/movies", label: "Movies", icon: Film },
  { href: "/tv", label: "TV Series", icon: Layers }
] as const

export default function Header() {
  const pathname = usePathname()
  const [searchValue, setSearchValue] = useState("")

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget
    const input = form.elements.namedItem('q') as HTMLInputElement | null
    if (!input) return

    const trimmed = searchValue.trim()
    input.value = trimmed
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/40 bg-slate-950/80 backdrop-blur-xl shadow-[0_12px_60px_rgba(8,47,73,0.45)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-4 md:justify-start">
          <Link href="/" className="group inline-flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 blur-lg bg-cyan-500/40 transition-colors group-hover:bg-cyan-400/60" />
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-500 to-blue-600 shadow-[0_10px_30px_rgba(14,165,233,0.35)]">
                <span className="text-xl font-black text-white">R+</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-wide text-white transition-colors group-hover:text-cyan-300 sm:text-2xl">
                RedaStream+
              </h1>
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 sm:text-xs">Cinematic Universe</p>
            </div>
          </Link>
        </div>

        <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:justify-end">
          <form
            action="/search"
            method="get"
            onSubmit={handleSubmit}
            className="flex w-full items-center gap-3 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 shadow-[0_10px_25px_rgba(6,182,212,0.2)] transition focus-within:border-cyan-400/70"
          >
            <Search className="h-4 w-4 text-cyan-200" />
            <input
              type="search"
              name="q"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search movies, series, or people"
              className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none sm:text-base"
              autoComplete="off"
            />
            <button
              type="submit"
              className="inline-flex rounded-full bg-cyan-500 px-4 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-cyan-400 sm:text-sm"
            >
              Search
            </button>
          </form>

          <div className="flex items-center justify-end gap-3">
            <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-800/60 bg-slate-900/60 text-slate-300 transition hover:-translate-y-0.5 hover:border-cyan-400/60 hover:text-white sm:h-11 sm:w-11">
              <Settings className="h-5 w-5" />
            </button>
            <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-800/60 bg-slate-900/60 text-slate-300 transition hover:-translate-y-0.5 hover:border-cyan-400/60 hover:text-white sm:h-11 sm:w-11">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                3
              </span>
            </button>
            <Link
              href="/profile"
              className="group inline-flex items-center gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/70 px-3 py-2 text-left transition hover:border-cyan-400/60 hover:bg-slate-900/90"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-[0_8px_22px_rgba(14,165,233,0.35)]">
                <User className="h-5 w-5" />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs uppercase tracking-wide text-slate-400">Signed in as</p>
                <p className="text-sm font-semibold text-white">viewer@redastream.app</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <nav className="mx-auto flex w-full max-w-7xl gap-2 overflow-x-auto px-4 pb-3 pt-1 text-sm lg:hidden">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href as any}
              className={`inline-flex flex-shrink-0 items-center gap-2 rounded-full border px-4 py-2 transition ${
                isActive
                  ? 'border-cyan-400/60 bg-cyan-500/10 text-cyan-100'
                  : 'border-transparent bg-slate-900/50 text-slate-300 hover:border-slate-700/60 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
