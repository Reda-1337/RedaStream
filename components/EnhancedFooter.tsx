"use client"

import Link from 'next/link'
import { Github, Twitter, Instagram, Mail } from 'lucide-react'

export default function EnhancedFooter() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { name: 'GitHub', href: 'https://github.com/Reda-1337', icon: Github },
    { name: 'Twitter', href: 'https://twitter.com', icon: Twitter },
    { name: 'Instagram', href: 'https://instagram.com', icon: Instagram },
    { name: 'Email', href: 'mailto:support@redastream.com', icon: Mail }
  ]

  return (
    <footer className="mt-16 border-t border-slate-800/40 bg-slate-950/90">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10 text-center">
        <div className="space-y-2">
          <Link href="/" className="text-lg font-semibold text-white">
            RedaStream
          </Link>
          <p className="text-sm text-slate-400">
            Discover, watch, and track the stories you love. Powered by TMDB.
          </p>
        </div>

        <p className="mx-auto max-w-3xl text-xs text-slate-500">
          <strong className="text-slate-300">Disclaimer:</strong> RedaStream is an indexing service. We do not host or
          upload any videos; all streams are provided by third-party services. Content availability may change without
          notice and remains the responsibility of the respective providers. Please respect the laws of your region and
          use the platform for personal preview purposes only.
        </p>

        <div className="flex items-center justify-center gap-4">
          {socialLinks.map(({ name, href, icon: Icon }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-800/60 bg-slate-900/70 text-slate-300 transition hover:border-cyan-400/60 hover:text-white"
              aria-label={name}
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </div>

        <p className="text-xs text-slate-500">© {currentYear} RedaStream.</p>
      </div>
    </footer>
  )
}
