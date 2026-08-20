import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "sans-serif"],
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
});

const siteUrl = "https://puntoraw.org";
const siteName = ".RAW Sessions";
const siteDescription =
  "Un podcast mastermind mensual enfocado en intenciones auténticas, responsabilidad y crecimiento. Conversaciones honestas que te impulsan hacia adelante.";

export const metadata: Metadata = {
  title: {
    default: ".RAW Sessions — Intenciones Auténticas. Responsabilidad. Crecimiento.",
    template: "%s | .RAW Sessions",
  },
  description: siteDescription,
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
    languages: {
      "es-419": "/",
      "en-US": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "es_419",
    alternateLocale: ["en_US"],
    url: siteUrl,
    siteName,
    title: ".RAW Sessions — Intenciones Auténticas. Responsabilidad. Crecimiento.",
    description: siteDescription,
    images: [
      {
        url: "/puntoraw_avatar.jpeg",
        width: 1200,
        height: 630,
        alt: ".RAW Sessions — Intenciones Auténticas. Responsabilidad. Crecimiento.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: ".RAW Sessions — Intenciones Auténticas. Responsabilidad. Crecimiento.",
    description: siteDescription,
    images: ["/puntoraw_avatar.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "geo.region": "US",
    "geo.placename": "United States",
    "content-language": "es-419, en-US",
  },
};

const navLinks = [
  { href: "/episodes", label: "Episodios" },
  { href: "/schedule", label: "Calendario" },
  { href: "/team", label: "Equipo" },
  { href: "/merch", label: "Merch" },
];

// Podcast structured data (JSON-LD)
const podcastJsonLd = {
  "@context": "https://schema.org",
  "@type": "PodcastSeries",
  name: siteName,
  description: siteDescription,
  url: siteUrl,
  image: `${siteUrl}/puntoraw_avatar.jpeg`,
  author: {
    "@type": "Person",
    name: "Greg Anthony",
  },
  inLanguage: ["es-419", "en-US"],
  genre: "Desarrollo Personal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5P894CQK81"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-5P894CQK81');
          `}
        </Script>

        {/* Podcast structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(podcastJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-gray-900"
            >
              master_sessions<span className="text-red-600">.RAW</span><span className="text-gray-400">/podcast</span>
            </Link>

            <MobileNav />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-gray-100 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-lg font-bold tracking-tight text-gray-900">
                  master_sessions<span className="text-red-600">.RAW</span><span className="text-gray-400">/podcast</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Intenciones Auténticas. Responsabilidad. Crecimiento.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors py-1"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Podcast Platform Badges */}
            <div className="mt-6 flex flex-wrap items-center gap-3 sm:gap-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Escúchanos en
              </span>
              <a
                href="https://open.spotify.com/show/1xyVfSvuMnRbMcdClJJT3Y"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1DB954">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
                Spotify
              </a>
              <a
                href="https://podcasts.apple.com/co/podcast/punto-raw/id1653224018"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#9933CC">
                  <path d="M5.34 0A5.328 5.328 0 000 5.34v13.32A5.328 5.328 0 005.34 24h13.32A5.328 5.328 0 0024 18.66V5.34A5.328 5.328 0 0018.66 0H5.34zm6.525 2.568c2.336 0 4.448.902 6.056 2.587 1.224 1.272 1.912 2.619 2.264 4.392.12.59-.12.947-.472.947-.36 0-.556-.244-.64-.736-.36-1.584-.876-2.676-1.87-3.736-1.4-1.488-3.18-2.256-5.27-2.256-2.463 0-4.622 1.2-5.956 3.24-.804 1.236-1.176 2.508-1.176 4.08 0 .276-.012.612.012.852.06.696-.348 1.068-.696 1.068-.384 0-.66-.348-.66-.876-.012-.492-.024-.852-.024-1.26 0-2.064.744-3.936 2.148-5.532C7.092 3.612 9.288 2.568 11.865 2.568zM12 7.128c1.656 0 3.108.768 4.14 2.04.636.78.96 1.548 1.116 2.676.06.468-.156.78-.516.78-.336 0-.552-.216-.612-.636-.168-1.236-.684-2.16-1.524-2.94-.804-.744-1.764-1.128-2.748-1.128-1.404 0-2.604.684-3.444 1.788-.516.684-.804 1.464-.804 2.412 0 .324.012.588.036.852.048.396-.192.684-.54.684-.384 0-.612-.288-.636-.72a8.72 8.72 0 01-.036-.972c0-1.344.516-2.58 1.488-3.588.972-1.008 2.256-1.548 3.636-1.548h.444zm-.12 4.332c.924 0 1.716.636 1.884 1.536.06.324.06.636 0 .948l-.744 3.78c-.108.552-.36.78-.66.78-.288 0-.54-.228-.648-.78l-.744-3.78a2.09 2.09 0 010-.948c.168-.9.996-1.536 1.912-1.536zm0 9.744c-.792 0-1.476-.672-1.476-1.464 0-.804.684-1.464 1.476-1.464.804 0 1.476.66 1.476 1.464 0 .792-.672 1.464-1.476 1.464z" />
                </svg>
                Apple Podcasts
              </a>
              <a
                href="https://www.youtube.com/channel/UCK0EHaEaACp8PE3zpcK6Y1w"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#FF0000">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
                  <path fill="white" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                YouTube
              </a>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-400">
              <span>&copy; {new Date().getFullYear()} .RAW Sessions. Todos los derechos reservados.</span>
              <a
                href="https://drkm.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-gray-500 transition-colors"
              >
                Desarrollado por DRKM Systems
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
