import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, formatDate, episodeCode } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Resúmenes y reflexiones de cada episodio de .RAW Sessions — las ideas clave, en texto.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const [featured, ...rest] = posts;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 md:pt-16 pb-8">
        <p className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-2">
          Blog
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Resúmenes de episodios
        </h1>
        <p className="text-gray-500">
          Las ideas clave de cada conversación, para leer, repasar y compartir.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Aún no hay publicaciones. ¡Vuelve pronto!</p>
          </div>
        ) : (
          <>
            {/* Featured (latest) */}
            <Link href={`/blog/${featured.slug}`} className="group block mb-10">
              <article className="rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200 transition-all overflow-hidden">
                {featured.cover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featured.cover}
                    alt=""
                    className="w-full aspect-[21/9] object-cover"
                  />
                )}
                <div className="p-6 sm:p-8">
                  <PostMeta post={featured} />
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-red-600 transition-colors mb-3">
                    {featured.title}
                  </h2>
                  <p className="text-gray-500 leading-relaxed mb-4 max-w-3xl">
                    {featured.excerpt}
                  </p>
                  <ReadMore />
                </div>
              </article>
            </Link>

            {/* The rest */}
            {rest.length > 0 && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Anteriores
                  </h2>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {rest.map((post) => (
                    <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                      <article className="h-full rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200 transition-all p-5 sm:p-6 flex flex-col">
                        <PostMeta post={post} />
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-600 transition-colors mb-1.5">
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
                          {post.excerpt}
                        </p>
                        <ReadMore />
                      </article>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function PostMeta({ post }: { post: ReturnType<typeof getAllPosts>[number] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mb-2">
      {post.season && post.seasonEpisode && (
        <>
          <span className="font-mono font-semibold text-gray-900 tracking-tight">
            {episodeCode(post.season, post.seasonEpisode)}
          </span>
          <span className="text-gray-200">·</span>
        </>
      )}
      <span>{formatDate(post.date, "short")}</span>
      <span className="text-gray-200">·</span>
      <span>{post.readingMinutes} min de lectura</span>
    </div>
  );
}

function ReadMore() {
  return (
    <span className="inline-flex items-center text-sm font-medium text-red-600">
      Leer
      <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
    </span>
  );
}
