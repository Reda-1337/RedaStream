import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-900/60 bg-slate-950/40 py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2 space-y-5">
            <div className="relative inline-flex">
              <div className="absolute inset-0 -m-2 rounded-[32px] bg-cyan-500/25 blur-3xl" />
              <Image
                src="/logo-wordmark.svg"
                alt="RedaStream+"
                width={280}
                height={110}
                className="relative h-12 w-auto"
                priority
              />
            </div>
            <p className="max-w-md text-sm text-slate-400">
              RedaStream+ lets you dive into premium films and series with a slick, cinematic interface inspired by the best streaming hubs.
            </p>
            <div className="text-xs text-slate-500">
              <p>This product uses the TMDb API but is not endorsed or certified by TMDb.</p>
              <Link
                href="https://www.themoviedb.org"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-cyan-300 transition hover:text-cyan-100"
              >
                <Image
                  src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
                  alt="TMDb"
                  width={120}
                  height={24}
                  className="h-6 w-auto"
                />
                <span>Visit TMDb</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-slate-300">Browse</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/movies" className="transition-colors hover:text-cyan-300">
                  Popular Movies
                </Link>
              </li>
              <li>
                <Link href="/tv" className="transition-colors hover:text-cyan-300">
                  Popular TV Shows
                </Link>
              </li>
              <li>
                <Link href="/" className="transition-colors hover:text-cyan-300">
                  Trending Today
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-slate-300">Legal</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="#" className="transition-colors hover:text-cyan-300">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-cyan-300">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-cyan-300">
                  DMCA
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 border-t border-slate-900/60 pt-6 text-center text-xs text-slate-500">
          <div className="flex items-center gap-2 text-cyan-400">
            <span className="inline-block h-2 w-2 rounded-full bg-cyan-400" />
            <span className="inline-block h-2 w-2 rounded-full bg-cyan-400/70" />
            <span className="inline-block h-2 w-2 rounded-full bg-cyan-400/50" />
          </div>
          <p>&copy; {new Date().getFullYear()} RedaStream+. Crafted for immersive streaming.</p>
        </div>
      </div>
    </footer>
  )
}
