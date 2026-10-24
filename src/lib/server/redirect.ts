export function safeRedirectTo(
  value: string | null | undefined,
  fallback = '/'
): string {
  if (!value) return fallback;
  try {
    const base = "http://internal.invalid";
    const url = new URL(value, base);
    if (url.origin !== base) return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
