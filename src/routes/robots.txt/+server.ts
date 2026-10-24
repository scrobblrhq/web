import type { RequestHandler } from "./$types";

export const GET: RequestHandler = ({ url }) => {
  const body = [
    "User-agent: *",
    "Disallow: /auth/",
    "Disallow: /search",
    "Disallow: /user/*/settings",
    "Disallow: /*?",
    "Allow: /",
    `Sitemap: ${new URL("/sitemap.xml", url).href}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};