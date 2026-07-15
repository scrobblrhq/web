# scrobblr-web

> Web frontend for [Scrobblr](https://github.com/scrobblrhq/scrobblr) — a modern, self-hosted alternative to last.fm.

Built with SvelteKit 5 + Tailwind CSS 4. Consumes the [`@scrobblr/types`](https://www.npmjs.com/package/@scrobblr/types) package published from the backend repo.

## Developing

```sh
bun install
bun run dev
```

Point the app at a Scrobblr backend by setting the environment variable in `.env`:

```
PUBLIC_API_URL=http://localhost:8080
```

## Building

```sh
bun run build
bun run preview
```

## Stack

- **Framework:** SvelteKit 5 (Svelte 5 runes)
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide
- **Markdown:** svelte-exmarkdown + rehype-highlight
- **API types:** `@scrobblr/types` (auto-generated from Rust backend via ts-rs)
