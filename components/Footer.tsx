import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-800/50 py-8">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 scale-[1.25] rounded-2xl bg-cyan-400/30 blur-xl" />
                <Image
                  src="/logo-mark.svg"
                  alt="RedaStream brand mark"
                  width={32}
                  height={32}
                  className="relative h-8 w-8 drop-shadow-[0_10px_24px_rgba(59,130,246,0.35)]"
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">
                RedaStream+
              </span>
            </div>
            <p className="mb-4 text-sm text-gray-400">
              Discover and stream your favorite movies and TV shows. Powered by TMDB for accurate metadata and recommendations.
            </p>
            <div className="text-xs text-gray-500">
              <p>This product uses the TMDb API but is not endorsed or certified by TMDb.</p>
              <Link
                href="https://www.themoviedb.org"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block transition-opacity hover:opacity-80"
              >
                <Image
                  src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
                  alt="TMDb"
                  width={120}
                  height={24}
                  className="h-6 w-auto"
                />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-white font-semibold">Browse</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/movies" className="transition-colors hover:text-purple-400">
                  Popular Movies
                </Link>
              </li>
              <li>
                <Link href="/tv" className="transition-colors hover:text-purple-400">
                  Popular TV Shows
                </Link>
              </li>
              <li>
                <Link href="/" className="transition-colors hover:text-purple-400">
                  Trending
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-white font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="#" className="transition-colors hover:text-purple-400">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-purple-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-purple-400">
                  DMCA
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800/50 pt-6 text-center text-sm text-gray-500">
          <p>&copy; 2024 RedaStream. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
