import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export interface PostFrontmatter {
  title: string;
  /** Short line under the title */
  subtitle?: string;
  date: string; // YYYY-MM-DD
  excerpt: string;
  /** Slug of the related episode in /episodes (optional) */
  episode?: string;
  season?: number;
  seasonEpisode?: number;
  spotifyId?: string;
  /** YouTube video ID (the part after watch?v=) — embeds the video and feeds the homepage */
  youtubeId?: string;
  /** e.g. "1h 36min" */
  duration?: string;
  /** Who led the session ("Sesión dirigida por") */
  host?: string;
  /** Everyone in the conversation */
  participants?: string[];
  author?: string;
  tags?: string[];
  cover?: string; // path under /public, e.g. /blog/algo-tiene-que-morir.jpg
  draft?: boolean;
}

export interface Post extends PostFrontmatter {
  slug: string;
  content: string;
  readingMinutes: number;
  headings: { id: string; text: string }[];
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function readPostFile(file: string): Post {
  const slug = file.replace(/\.mdx?$/, "");
  const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
  const { data, content } = matter(raw);
  const fm = data as PostFrontmatter;

  if (!fm.title || !fm.date) {
    throw new Error(`content/blog/${file}: "title" and "date" are required in frontmatter`);
  }

  // gray-matter parses unquoted YAML dates into Date objects
  const date =
    (fm.date as unknown) instanceof Date
      ? (fm.date as unknown as Date).toISOString().slice(0, 10)
      : String(fm.date);

  // Strip JSX tags before counting words
  const words = content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length;

  const headings = [...content.matchAll(/^## (.+)$/gm)].map((m) => {
    const text = m[1].trim();
    return { id: slugify(text), text };
  });

  return {
    ...fm,
    date,
    excerpt: fm.excerpt ?? "",
    author: fm.author ?? "Punto Raw",
    tags: fm.tags ?? [],
    slug,
    content,
    participants: fm.participants ?? [],
    readingMinutes: Math.max(1, Math.round(words / 200)),
    headings,
  };
}

/** All published posts, newest first. Files starting with "_" are ignored (templates). */
export function getAllPosts(): Post[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => /\.mdx?$/.test(f) && !f.startsWith("_"))
    .map(readPostFile)
    .filter((p) => !p.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

/** Find the blog post that summarizes a given episode slug, if any. */
export function getPostForEpisode(episodeSlug: string): Post | undefined {
  return getAllPosts().find((p) => p.episode === episodeSlug);
}

export function formatDate(date: string, month: "long" | "short" = "long") {
  // Parse as local noon to avoid the date shifting a day in US timezones
  const d = new Date(`${date}T12:00:00`);
  return d.toLocaleDateString("es-419", { year: "numeric", month, day: "numeric" });
}

/** Technical episode code, e.g. S02//EP006 */
export function episodeCode(season?: number, seasonEpisode?: number) {
  if (!season || !seasonEpisode) return null;
  return `S${String(season).padStart(2, "0")}//EP${String(seasonEpisode).padStart(3, "0")}`;
}

export function youtubeThumb(id: string, quality: "maxresdefault" | "hqdefault" = "maxresdefault") {
  return `https://i.ytimg.com/vi/${id}/${quality}.jpg`;
}

/** Newest published post that has a YouTube video — used as the homepage fallback. */
export function getLatestVideo(): { id: string; title: string } | null {
  const p = getAllPosts().find((post) => post.youtubeId);
  return p?.youtubeId ? { id: p.youtubeId, title: p.title } : null;
}
