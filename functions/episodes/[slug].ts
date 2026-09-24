// /episodes/:slug — serve the pre-built page if it exists; otherwise serve the
// "pendiente" shell, which loads the episode from D1 in the browser.
// This makes episodes added through /upload work without a rebuild.
interface Env {
  ASSETS: Fetcher;
}

export const onRequest: PagesFunction<Env, "slug"> = async (context) => {
  const res = await context.next();
  if (res.status !== 404) return res;

  const url = new URL(context.request.url);
  const slug = String(context.params.slug || "");

  // Only rewrite real page requests (not .txt RSC payloads, images, etc.)
  if (slug.includes(".") || !/^[a-z0-9-]{1,200}$/.test(slug)) return res;

  const shell = await context.env.ASSETS.fetch(new URL("/episodes/pendiente", url.origin));
  if (!shell.ok) return res;

  return new Response(shell.body, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
};
