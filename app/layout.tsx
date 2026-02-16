import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' })

export const metadata: Metadata = {
  metadataBase: new URL('https://reda-stream.vercel.app'),
  title: {
    default: 'RedaStream+',
    template: '%s | RedaStream+'
  },
  description: 'Movies & TV streaming catalog powered by TMDB',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' }
    ],
    apple: { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    shortcut: ['/favicon.svg']
  },
  manifest: '/site.webmanifest'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-[#05060b]">
      <head>
        {/* 🛡️ LAYER 3 — Ad Popup Killer
            Overrides window.open globally so popup ads from
            iframes are silently killed before they can open. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  'use strict';

  // Override window.open to block all popup attempts
  var _open = window.open.bind(window);
  window.open = function(url, target, features) {
    if (!target || target === '_blank' || target === '_new' || target === '_tab') {
      console.warn('[AdBlock] Blocked popup:', url);
      return null;
    }
    return _open(url, target, features);
  };

  // Block top-level navigation hijacking from iframes
  try {
    Object.defineProperty(window, 'top', {
      get: function() { return window; },
      configurable: true
    });
  } catch(e) {}

  // Anti-tabnapping: if location was changed while tab was hidden, go back
  var origUrl = location.href;
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden &&
        location.href !== origUrl &&
        !location.href.startsWith(origUrl.split('?')[0])) {
      history.back();
    }
  });

  // Intercept beforeunload from iframe-triggered redirects
  window.addEventListener('beforeunload', function(e) {
    var el = document.activeElement;
    if (el && el.tagName === 'IFRAME') {
      e.preventDefault();
      e.returnValue = '';
      return '';
    }
  }, { capture: true });
})();
`,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans text-slate-100 antialiased`}>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1d2845_0%,_#07080f_60%,_#03040a_100%)]">
          {children}
        </div>
      </body>
    </html>
  )
}
