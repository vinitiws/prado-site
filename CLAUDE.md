# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Next.js warning

This is **Next.js 16.2.6** — APIs, conventions, and file structure may differ from your training data. Before writing any code, read the relevant guide in `node_modules/next/dist/docs/`. Heed deprecation notices.

## Project overview

Prado Calçados digital catalog (MVP). Brand manufactures *botas* and *botinas de segurança* since 1994. Public storefront + admin panel backed by Supabase.

- **Framework:** Next.js 16 (App Router) + React 19
- **Styling:** TailwindCSS 4 (CSS-based `@theme inline` in `src/app/globals.css` — no `tailwind.config.js`)
- **Animations:** Framer Motion
- **State:** Zustand (`zustand` is in deps; usage is minimal so far)
- **Forms/validation:** Zod, Radix UI primitives, react-icons
- **DB / Auth / Storage / Email:** Supabase (`@supabase/ssr` + `@supabase/supabase-js`) and `resend`
- **Hosting:** Vercel

## Common commands

```bash
npm run dev      # next dev (Turbopack, with --max-old-space-size=4096)
npm run build    # next build
npm run start    # next start
npm run lint     # eslint (config in eslint.config.mjs)
```

There is no test runner configured. The `dev` script raises Node's heap to 4 GB because Turbopack can be memory-hungry on this project.

## Environment

Copy `.env.local.example` → `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — required
- `SUPABASE_SERVICE_ROLE_KEY` — server-side admin client only
- `RESEND_API_KEY` — transactional email
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` — optional anti-spam on partner form
- `SITE_URL`, `NEXT_PUBLIC_SITE_URL` — used for absolute URLs / metadata

Database schema lives in `supabase-schema.sql` (root) plus incremental files in `supabase/migrations/` and `scripts/`. Public Storage bucket is named `imagens`.

## Code map

```
src/
├── app/
│   ├── page.tsx                       # Homepage
│   ├── layout.tsx                     # Root layout: Navbar, ConditionalFooter, WhatsAppButton
│   ├── globals.css                    # Tailwind v4 entry + @theme brand tokens + Grift @font-face
│   ├── proxy.ts                       # Auth gate for /admin/* (NOT middleware.ts — see below)
│   ├── auth/                          # logout handler
│   ├── admin/                         # Admin section
│   │   ├── layout.tsx → AdminShell    # Sidebar nav (Dashboard, Produtos, Imagens) + Logout
│   │   ├── login/                     # /admin/login
│   │   ├── dashboard/                 # KPIs
│   │   ├── produtos/                  # CRUD list, [id] edit, novo
│   │   └── imagens/                   # Site carousel/card/banner manager
│   ├── api/                           # Route Handlers
│   │   ├── auth/login/                # Email/password login
│   │   ├── produtos/                  # GET/POST list, [id] GET/PUT/DELETE, [id]/imagens, imagens
│   │   ├── imagens/                   # Site images CRUD
│   │   ├── upload/                    # File upload to Supabase Storage
│   │   └── parceiros/                 # "Seja Parceiro" form (Resend + Turnstile)
│   ├── produtos/, sobre/, parceiro/   # Public storefront pages
│   └── sitemap.ts
├── components/
│   ├── ui/        # Button, Card, Input, Dialog, etc. (Radix wrappers + tailwind-merge)
│   ├── layout/    # Navbar, Footer, ConditionalFooter, WhatsAppButton
│   ├── home/      # Hero, ProductCards, Banner
│   ├── produtos/, admin/, parceiro/    # Feature-scoped
├── lib/
│   ├── utils.ts                       # cn() — clsx + tailwind-merge
│   └── supabase/
│       ├── client.ts                  # Browser client (createBrowserClient)
│       ├── server.ts                  # Server client with cookie adapter (cookies() from next/headers)
│       └── admin.ts                   # Service-role client — NEVER import in client components
├── hooks/use-auth.ts                  # Client hook: user, login(), logout()
├── proxy.ts                           # Next 16 proxy: gates /admin/* (see note below)
└── types/index.ts                     # Categoria, Subcategoria, Produto, ProdutoImagem, SiteImagem
```

## Architecture notes

### `src/proxy.ts` (Next 16 `proxy.ts`, not `middleware.ts`)
Next 16 renamed `middleware` → `proxy`. This file gates `/admin/*` (except `/admin/login`) by checking for the Supabase auth cookie (`sb-<projectRef>-auth-token`). It also sets `Cache-Control: private, no-cache, no-store, must-revalidate` on every admin response. The matcher is `/admin/:path*`.

### Three Supabase clients — pick the right one
- **`lib/supabase/client.ts`** — `createBrowserClient()`. Use in `'use client'` components and hooks.
- **`lib/supabase/server.ts`** — `createServerClient()` wired to `next/headers` `cookies()`. Use in Server Components, Server Actions, and Route Handlers.
- **`lib/supabase/admin.ts`** — `supabase-js` with `SUPABASE_SERVICE_ROLE_KEY` and `persistSession: false`. **Server-only.** Bypasses RLS — use only for trusted server-side operations (uploads, partner form processing, etc.).

All three return `null` when env vars are missing or set to the placeholder — write callers to handle that.

### Brand tokens (Tailwind v4)
Colors are declared in `src/app/globals.css` under `@theme inline`:
- `branco` `#FFFCF4`, `safety` `#FEC761`, `country` `#9F5234`, `azul` `#2C3B4E`, `marinho` `#1C2632`, `bege` `#CCC1A9`
- Use them as Tailwind utilities: `bg-branco`, `text-marinho`, `border-bege/10`, etc.
- Font: `Grift` (OTF files in `public/fonts/`). Falls back to `system-ui` if missing.

### `next.config.ts` tweaks
- `images.remotePatterns` allows `*.supabase.co` for `next/image`.
- `experimental.turbopackFileSystemCacheForDev: true` and `preloadEntriesOnStart: false` to keep Turbopack memory under control — leave these alone.

### Data shape (`src/types/index.ts`)
- `Categoria` → `Subcategoria` → `Produto` (each Produto has `ProdutoImagem[]`).
- `SiteImagem` holds carousel/card/banner assets with optional `url_mobile` / `storage_path_mobile` for responsive hero.

### Storage layout
Public bucket `imagens` holds product gallery and site assets. Uploads go through `src/app/api/upload/route.ts`, which uses the service-role client. The admin product/image CRUD pages expect URLs returned from Storage.

## Notes for future work

- No test suite yet — if you add one, `package.json` has no test script; you'll need to wire it up.
- `lucide-react` is pinned to `^1.16.0` (an old line). Most call sites import from `react-icons` instead — be consistent with whatever the file already uses.
- The partner form (`/parceiro` → `api/parceiros`) uses Cloudflare Turnstile when keys are set; it degrades gracefully without them.
- Commit messages in this repo are short, lowercase Portuguese (e.g. `corrigido vunerabilidade de segurança admin e logout`). Match that style.
