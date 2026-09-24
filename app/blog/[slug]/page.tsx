import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPost, formatDate, episodeCode } from "@/lib/blog";
import { mdxComponents } from "@/components/blog-mdx";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Publicación no encontrada" };

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: `${post.title} | .RAW Sessions`,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
      ...(post.cover ? { images: [{ url: post.cover }] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const all = getAllPosts();
  const idx = all.findIndex((p) => p.slug === post.slug);
  const newer = idx > 0 ? all[idx - 1] : undefined;
  const older = idx < all.length - 1 ? all[idx + 1] : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    inLanguage: "es-419",
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: ".RAW Sessions" },
    mainEntityOfPage: `https://puntoraw.org/blog/${post.slug}`,
    ...(post.cover ? { image: `https://puntoraw.org${post.cover}` } : {}),
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 md:pt-12 pb-8">
        <Link
          href="/blog"
          className="text-gray-400 hover:text-gray-900 transition text-sm mb-8 inline-flex items-center py-2"
        >
          ← Volver al Blog
        </Link>

        {/* Kicker + headline */}
        <div className="flex items-end justify-between gap-4 pb-2 border-b-[6px] border-gray-900">
          <p className="font-mono text-sm sm:text-base font-semibold tracking-tight text-gray-900">
            {episodeCode(post.season, post.seasonEpisode) ?? "PUNTO//RAW"}
          </p>
          <p className="font-mono text-[11px] uppercase tracking-widest text-gray-400">
            {post.date.replaceAll("-", ".")}
          </p>
        </div>
        <h1 className="font-headline font-black uppercase tracking-[-0.03em] text-red-600 text-[3.4rem] sm:text-7xl md:text-[5.25rem] leading-[0.95] sm:leading-[0.88] mt-4 mb-5 text-balance">
          {post.title}
        </h1>
        {post.subtitle && (
          <p className="text-lg md:text-xl text-gray-500 leading-snug mb-5 text-balance">
            {post.subtitle}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-500">
          <span className="font-medium text-gray-700">{post.author}</span>
          <span className="text-gray-300">·</span>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span className="text-gray-300">·</span>
          <span>{post.readingMinutes} min de lectura</span>
        </div>

        {/* Session info */}
        {(post.duration || post.host || (post.participants && post.participants.length > 0)) && (
          <dl className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-px overflow-hidden rounded-xl border border-gray-100 bg-gray-100">
            {post.duration && (
              <div className="bg-white px-4 py-3">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Duración</dt>
                <dd className="font-medium text-gray-900">{post.duration}</dd>
              </div>
            )}
            {post.host && (
              <div className="bg-white px-4 py-3">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Dirige la sesión</dt>
                <dd className="font-medium text-gray-900">{post.host}</dd>
              </div>
            )}
            {post.participants && post.participants.length > 0 && (
              <div className="bg-white px-4 py-3 col-span-2 sm:col-span-1">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">En la mesa</dt>
                <dd className="font-medium text-gray-900">{post.participants.join(", ")}</dd>
              </div>
            )}
          </dl>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-3 py-1"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {post.cover && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.cover} alt="" className="w-full rounded-2xl aspect-[21/9] object-cover" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        {/* Listen */}
        {post.spotifyId && (
          <div className="mb-10">
            <iframe
              src={`https://open.spotify.com/embed/episode/${post.spotifyId}?utm_source=generator`}
              width="100%"
              height="152"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-xl border-0"
              title={`Escuchar: ${post.title}`}
            />
          </div>
        )}

        {/* No embedded player yet → link to the show */}
        {!post.spotifyId && (
          <div className="mb-10 flex flex-wrap items-center gap-3 rounded-xl bg-gray-50 px-5 py-4">
            <span className="text-sm font-semibold text-gray-700 mr-1">Escucha el episodio:</span>
            {[
              ["Spotify", "https://open.spotify.com/show/1xyVfSvuMnRbMcdClJJT3Y"],
              ["Apple Podcasts", "https://podcasts.apple.com/co/podcast/punto-raw/id1653224018"],
              ["YouTube", "https://www.youtube.com/channel/UCK0EHaEaACp8PE3zpcK6Y1w"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-red-600 hover:text-red-700 bg-white border border-gray-200 rounded-lg px-3 py-1.5"
              >
                {label} ↗
              </a>
            ))}
          </div>
        )}

        {/* Table of contents */}
        {post.headings.length >= 3 && (
          <nav aria-label="En este resumen" className="mb-10 rounded-xl border border-gray-100 p-5 text-[15px]">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">En este resumen</p>
            <ol className="space-y-1.5">
              {post.headings.map((h, i) => (
                <li key={h.id} className="flex gap-3">
                  <span className="text-sm font-semibold text-red-500 tabular-nums w-5">{String(i + 1).padStart(2, "0")}</span>
                  <a href={`#${h.id}`} className="text-gray-600 hover:text-red-600 transition-colors">
                    {h.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Body */}
        <div>
          <MDXRemote source={post.content} components={mdxComponents} />
        </div>

        {/* Episode CTA */}
        {post.episode && (
          <Link
            href={`/episodes/${post.episode}`}
            className="group mt-12 flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200 transition-all p-5 sm:p-6"
          >
            <div>
              <p className="text-xs font-bold text-red-500 uppercase tracking-wide mb-1">
                Escucha el episodio completo
              </p>
              <p className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                {post.title}
              </p>
            </div>
            <span className="text-red-600 text-xl group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        )}

        {/* Prev / next */}
        {(newer || older) && (
          <nav className="mt-12 pt-8 border-t border-gray-200 grid gap-4 sm:grid-cols-2">
            {older ? (
              <Link href={`/blog/${older.slug}`} className="group">
                <p className="text-xs text-gray-400 mb-1">← Anterior</p>
                <p className="font-medium text-gray-900 group-hover:text-red-600 transition-colors">
                  {older.title}
                </p>
              </Link>
            ) : (
              <span />
            )}
            {newer && (
              <Link href={`/blog/${newer.slug}`} className="group sm:text-right">
                <p className="text-xs text-gray-400 mb-1">Siguiente →</p>
                <p className="font-medium text-gray-900 group-hover:text-red-600 transition-colors">
                  {newer.title}
                </p>
              </Link>
            )}
          </nav>
        )}
      </div>
    </article>
  );
}
