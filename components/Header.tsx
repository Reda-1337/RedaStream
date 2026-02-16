"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Film, Home, Layers, Search, User, Bell, Settings, Tv, BookOpen, Radio, Menu, X } from "lucide-react"
import InstantSearch from "./InstantSearch"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/movies", label: "Movies", icon: Film },
  { href: "/tv", label: "TV Series", icon: Layers },
  { href: "/kdramas", label: "K-Dramas", icon: Tv },
  { href: "/anime", label: "Anime", icon: Layers },
  { href: "/manga", label: "Manga", icon: BookOpen },
  { href: "/live", label: "Live TV", icon: Radio },
] as const

export default function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/40 bg-slate-950/80 backdrop-blur-xl shadow-[0_12px_60px_rgba(8,47,73,0.45)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:gap-4 md:py-4">
        {/* Logo + Mobile toggle */}
        <div className="flex items-center justify-between gap-4 md:justify-start">
          <Link href="/" className="group relative inline-flex flex-shrink-0">
            <div className="absolute inset-0 -m-2 rounded-[32px] bg-cyan-500/20 blur-3xl transition duration-500 group-hover:bg-cyan-400/30" />
            <Image
              src="/logo-wordmark.svg"
              alt="RedaStream+"
              width={256}
              height={96}
              priority
              className="relative h-10 w-auto md:h-12 2xl:h-14"
            />
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800/60 bg-slate-900/60 text-slate-300 transition hover:text-white md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Search + Actions */}
        <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:justify-end md:gap-4">
          {/* Real-time search */}
          <div className="w-full md:max-w-lg 2xl:max-w-xl">
            <InstantSearch />
          </div>

          {/* Action buttons */}
          <div className="hidden md:flex items-center gap-2">
            <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-800/60 bg-slate-900/60 text-slate-300 transition hover:-translate-y-0.5 hover:border-cyan-400/60 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400/60 sm:h-11 sm:w-11 2xl:h-12 2xl:w-12">
              <Settings className="h-5 w-5" />
            </button>
            <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-800/60 bg-slate-900/60 text-slate-300 transition hover:-translate-y-0.5 hover:border-cyan-400/60 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400/60 sm:h-11 sm:w-11 2xl:h-12 2xl:w-12">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                3
              </span>
            </button>
            <Link
              href="/profile"
              className="group inline-flex items-center gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/70 px-3 py-2 text-left transition hover:border-cyan-400/60 hover:bg-slate-900/90 focus-visible:ring-2 focus-visible:ring-cyan-400/60"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-[0_8px_22px_rgba(14,165,233,0.35)]">
                <User className="h-5 w-5" />
              </div>
              <div className="hidden lg:block">
                <p className="text-xs uppercase tracking-wide text-slate-400">Signed in as</p>
                <p className="text-sm font-semibold text-white">viewer@redastream.app</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop nav — visible on lg+ */}
      <nav className="mx-auto hidden w-full max-w-7xl items-center gap-1 px-4 pb-3 pt-0 lg:flex 2xl:gap-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href))
          const isLive = href === "/live"
          return (
            <Link
              key={href}
              href={href as any}
              className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 2xl:text-base 2xl:px-5 2xl:py-2.5 focus-visible:ring-2 focus-visible:ring-cyan-400/60 ${isActive
                ? 'text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
            >
              <Icon className={`h-4 w-4 2xl:h-5 2xl:w-5 ${isActive ? 'text-cyan-400' : ''}`} />
              {label}
              {isLive && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              )}
              {isActive && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 nav-active-line" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Mobile nav — expandable menu */}
      {mobileMenuOpen && (
        <nav className="lg:hidden border-t border-slate-800/40 bg-slate-950/95 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-3">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== "/" && pathname.startsWith(href))
              const isLive = href === "/live"
              return (
                <Link
                  key={href}
                  href={href as any}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`inline-flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${isActive
                    ? 'bg-cyan-500/10 text-cyan-100'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                    }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : ''}`} />
                  {label}
                  {isLive && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  )}
                </Link>
              )
            })}

            {/* Mobile action buttons */}
            <div className="flex items-center gap-3 border-t border-slate-800/40 pt-3 mt-2">
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-800/60 bg-slate-900/60 text-slate-300">
                <Settings className="h-5 w-5" />
              </button>
              <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-800/60 bg-slate-900/60 text-slate-300">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">3</span>
              </button>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-800/60 bg-slate-900/70 px-3 py-2 text-sm text-white"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
                  <User className="h-4 w-4" />
                </div>
                Profile
              </Link>
            </div>
          </div>
        </nav>
      )}

      {/* Mobile horizontal nav — quick access when menu is closed */}
      {!mobileMenuOpen && (
        <nav className="mx-auto flex w-full max-w-7xl gap-2 overflow-x-auto px-4 pb-3 pt-1 text-sm lg:hidden scrollbar-hide">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href))
            const isLive = href === "/live"
            return (
              <Link
                key={href}
                href={href as any}
                className={`inline-flex flex-shrink-0 items-center gap-2 rounded-full border px-4 py-2 transition ${isActive
                  ? 'border-cyan-400/60 bg-cyan-500/10 text-cyan-100'
                  : 'border-transparent bg-slate-900/50 text-slate-300 hover:border-slate-700/60 hover:text-white'
                  }`}
              >
                <Icon className="h-4 w-4" />
                {label}
                {isLive && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                )}
              </Link>
            )
          })}
        </nav>
      )}
    </header>
  )
}
