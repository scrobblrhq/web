import { getLocale } from "#lib/i18n.svelte";

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(
    getLocale() === "es" ? "es-MX" : "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );
}

// Will try to DRY this later
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "ahora mismo";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  return `hace ${Math.floor(hrs / 24)} d`;
}

export function formatCount(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return String(n);
}

export function joinedYear(iso: string): string {
  return new Date(iso).getFullYear().toString();
}

export function capitalize(input: string) {
  return input.length > 0 ? input[0].toUpperCase() + input.slice(1) : "";
}
