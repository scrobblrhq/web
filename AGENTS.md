# Repository Guidelines

## Project Structure

This is a SvelteKit 5 application using TypeScript and Tailwind CSS 4. Routes and route-specific server logic live in `src/routes/`; shared UI, API clients, remote functions, stores, hooks, and utilities live in `src/lib/`. Static assets are in `static/`, while generated API schema and localization types live in `src/lib/api/schema.d.ts` and `src/lib/i18n/i18n-types.ts`. Profile-specific components belong beside their route in `_components/`.

## Development Commands

The repository includes `bun.lock`; use Bun to install dependencies and run scripts:

- `bun install` installs dependencies.
- `bun run dev` starts the local Vite development server.
- `bun run check` synchronizes SvelteKit and runs Svelte and TypeScript diagnostics.
- `bun run build` creates the production build; `bun run preview` serves it locally.
- `bun run api:types` refreshes the generated API types from the live OpenAPI schema. Run only when intentionally updating the API contract.

## Coding Style

Follow nearby code conventions: Svelte components use PascalCase filenames, route files follow SvelteKit names such as `+page.svelte` and `+page.server.ts`, and utilities use descriptive camelCase names. Use TypeScript for application logic, keep server-only API access in `src/lib/server/` or `+page.server.ts`, and use remote functions in `src/lib/remote/` for client-invoked server operations. Prefer existing design tokens and Tailwind utilities over new one-off styles. Keep generated files generated; edit their source/configuration instead.

## Testing and Verification

There is no dedicated test script or checked-in test suite yet. For UI or route changes, run `bun run check`; run `bun run build` when validating production compilation. Add tests alongside the affected feature if a test framework is introduced, and use clear names describing the behavior under test.

## Commits and Pull Requests

Recent history uses short, informal summaries and does not establish a strict commit format. Write concise, action-oriented commit subjects that describe the change. Pull requests should explain the user-visible behavior, list important implementation details, link related issues when available, and include screenshots for visual changes. Mention the checks you ran and any that remain outstanding.

## Configuration and Secrets

Use `.env.example` as the configuration reference. Keep local credentials and tokens out of source control; never commit populated environment files.
