# MARK — Project Status Snapshot

Date: 2025-10-20
Repo: `d:\Work\DrBushraMirzah\DrbushramirzhaBlog\frontend`
Preview: `http://localhost:3000/`

## Implemented Pages
- Home: `src/app/page.tsx` (Recent Articles section + Highlights)
- About: `src/app/about/page.tsx`
- Blogs (list + filters): `src/app/blogs/page.tsx`
- Blog detail (dynamic): `src/app/blogs/[id]/page.tsx`
- Contact (server action form): `src/app/contact/page.tsx`, `src/app/contact/actions.ts`

## Components & Data
- Header: `src/components/Header.tsx` (links to `/blogs`, `/about`, `/contact`)
- Footer: `src/components/Footer.tsx`
- BlogCard: `src/components/BlogCard.tsx`
- Posts data module: `src/data/posts.ts` (sample typed posts)

## Layout & Styling
- Global layout integrates Header/Footer: `src/app/layout.tsx`
- Tailwind enabled: `tailwind.config.js`, `src/app/globals.css`
- Images available under `public/Images/`

## Verification
- Navigation works across Home, About, Blogs, Blog detail, and Contact
- Blogs page search and category filtering operate as expected
- Contact form validates and returns server action status
- Preview shows no browser errors

## Notable Routes
- `/` — Home
- `/about` — About
- `/blogs` — Blog list (search + category filters)
- `/blogs/[id]` — Blog detail
- `/contact` — Contact form

## Next Suggestions
- Add per-page `metadata` (title/description/OpenGraph) for SEO
- Replace sample images with final assets; refine copy and disclaimers
- Consider category routes (e.g., `/blogs/category/{name}`) and tag chips
- Improve mobile nav (hamburger menu, focus traps, ARIA labels)
- Optional CMS integration (Markdown, headless CMS) for posts
- Content note: replace HTML entities (e.g., `&apos;`) in `posts.ts` with actual characters for cleaner UI

---
This MARK captures the current implementation and verified behavior to date.


# MARK — Update

Date: 2025-10-21
Repo: `d:\Work\DrBushraMirzah\DrbushramirzhaBlog\frontend`
Dev Preview: `http://localhost:3001/` (port 3000 in use)

## Admin UI Routes & Layout
- `/admin` now loads Dashboard via `src/app/admin/page.tsx` → `src/app/admin/dashboard/page.tsx`
- Admin layout: `src/app/admin/layout.tsx` (sidebar with links)
- Admin pages:
  - Login: `src/app/admin/login/page.tsx`
  - Dashboard: `src/app/admin/dashboard/page.tsx`
  - Create: `src/app/admin/create/page.tsx`
  - Edit: `src/app/admin/edit/[id]/page.tsx`

## Admin API Client
- Client module: `src/app/admin/api.ts`
- Base: `NEXT_PUBLIC_ADMIN_API` or default `http://localhost:8080`
- Helpers: `apiGet`, `apiPost`, `apiPut`, `apiDelete` (attach `Authorization: Bearer <token>`)

## Integration Note (with Backend)
- Backend admin protection expects `admin_token` cookie (JWT) on requests.
- Current admin client sends Bearer token and does not include cookies; cross-origin fetch also lacks `credentials: 'include'`.
- To ensure admin flows work, set:
  - `NEXT_PUBLIC_ADMIN_API=http://localhost:8080/api` (matches backend `/api/*` paths)
  - Update admin API client to use `credentials: 'include'` and rely on cookie; or extend backend to accept Bearer tokens.

## Config Warning
- Next.js warns: `experimental.turbo` expects an object; current `next.config.mjs` sets `turbo: false`.
- Recommendation: remove `experimental.turbo` section entirely (dev already uses `--turbopack`).

---
This MARK records the admin UI linkage and key integration tasks needed for end-to-end functionality.