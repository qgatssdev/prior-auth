@AGENTS.md

# PA Desk web

Next.js (App Router) + TypeScript, Tailwind + shadcn/Radix, TanStack Query for server state,
Formik + Yup for forms, axios for transport, react-hot-toast. Same layout as yadsale-frontend.

```
npm run dev      # next dev on :3000 (API on :4000)
npm run build
npm run lint
npm run format   # prettier --write .
```

## Layout

- `src/app/(main-app)` — the app shell (sidebar + top bar) and its pages. Each `page.tsx` is
  thin (metadata + `<XView />`); its pieces live in a sibling `components/` folder.
- `src/services/<domain>/` — one folder per API domain: `<domain>.route.ts` (URLs),
  `index.ts` (axios calls), `queries.ts` / `mutation.ts` (TanStack Query hooks), `types.ts`.
  Mutations invalidate the queue, stats and case queries themselves.
- `src/common` — shared feature components (status badge, due label, pickers);
  `src/components` — `ui/` (shadcn) and `layout/` (sidebar, top bar, page header).
- `src/validations` — Yup schemas. `src/utils` — helpers, dates, status and code labels.
- `src/config` — env values (`NEXT_PUBLIC_API_URL`) and `LIVE_REFRESH_MS`.

## Rules

- Lifecycle rules live in the API (`api/src/modules/prior-auths/transitions.ts`). The UI
  shows the `allowedActions` / `insurerActions` the API returns; it never decides moves.
- Validate untrusted data once at the boundary (API responses are typed in `services/*/types.ts`);
  trust typed code everywhere else.
- Commits: single-line Conventional Commit subject, no trailers.
