# Kubeb Client Website

Next.js 15 (App Router) + TypeScript + Tailwind CSS + Framer Motion.

Connected to the Kubeb Bot's API for real login, license status, live stats,
changelog, vouches, and gated downloads — see that project's README for the
backend setup this depends on.

## Environment variables

Create `.env.local`:

```
# Public - safe to expose in the browser
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_discord_client_id
NEXT_PUBLIC_DISCORD_REDIRECT_URI=https://yourdomain.com/api/auth/callback

# Server-only - NEVER prefix these with NEXT_PUBLIC_
KUBEB_API_URL=https://your-api-domain.com
KUBEB_API_SECRET=must_match_API_SECRET_in_the_bot_project's_.env
```

`KUBEB_API_SECRET` is what lets this website's server-side routes (login
callback, account status, vouch submission, download) talk to the bot's
protected API endpoints. It's read only in Next.js Route Handlers
(`app/api/**/route.ts`), never sent to the browser.

## Environment variables

Copy `.env.example` to `.env.local` for local dev, and set the same
values in Vercel's project settings for production. See that file for
what each one does — in short: your Discord OAuth Client ID (public),
your bot API's URL, and a shared secret that must match the bot
project's `API_SECRET` exactly (server-only, never exposed to the browser).

## What this connects to

This website has no database of its own — every dynamic piece (login,
license status, download gating, vouches, live stats, changelog) is
served by the bot project's FastAPI service. Deploy that first (see its
own README), then point `NEXT_PUBLIC_API_URL` / `KUBEB_API_URL` at it.

## Run locally

```
npm install
npm run dev
```

Open http://localhost:3000.

## Build for production

```
npm run build
npm start
```

This was fully build-tested (production build, type checking, and lint
all pass with 0 errors) before delivery — the only thing that needs
network access it doesn't have in a fully offline environment is
downloading the Inter and JetBrains Mono fonts from Google Fonts on
first build, which happens automatically as long as you have a normal
internet connection.

## Deploy to Vercel

1. Push this to a GitHub repo
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Framework preset auto-detects as Next.js — no config needed
4. Deploy

## Before going live

- Update `siteUrl` in `app/layout.tsx` and the URLs in `app/sitemap.ts` /
  `app/robots.ts` to your real domain
- Replace the placeholder Discord/GitHub links in `components/Footer.tsx`
  and `components/DiscordSection.tsx` with your real URLs
- Wire the Download buttons in `components/DownloadSection.tsx` to your
  actual file hosting/CDN
- Replace the content in `app/terms/page.tsx` and `app/privacy/page.tsx`
  with real legal text
- All copy (features, testimonials, changelog, FAQ, stats) lives in one
  place: `lib/data.ts` — edit there rather than hunting through components

## Project structure

```
app/            routes, layout, metadata, SEO files
components/     all UI sections and shared widgets
components/icons/  brand icons not in lucide-react (Discord)
lib/data.ts     all site copy/content in one place
lib/utils.ts    className merge helper
```
