// Redirect upload.puntoraw.org → /upload page
export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);

  // If on upload subdomain and hitting the root, redirect to /upload
  if (url.hostname === "upload.puntoraw.org" && url.pathname === "/") {
    return Response.redirect(`${url.origin}/upload`, 302);
  }

  return context.next();
};
