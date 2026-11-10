# DecayWatch

Track ranked decay timers across all your Diamond+ League of Legends accounts.

Ranked players above Diamond lose LP (and eventually rank) if they don't play often enough. DecayWatch tracks the countdown for every account you play on, across every server, so nothing slips through the cracks.

## How it works

1. Log into each account in the LoL client
2. Check the "You decay in: X days" timer on each account
3. Add the account here with the number from the client
4. The app calculates your exact decay date and shows urgency

## Decay intervals

| Tier | Decay every |
|------|-------------|
| Diamond | 28 days |
| Master | 14 days |
| Grandmaster | 14 days |
| Challenger | 14 days |

## Features

- Public `/demo` playground with three fictional accounts, working Played and timer controls, reset, and no authentication or storage writes. Demo changes reset on refresh or leaving the page.

- Track multiple accounts across all servers
- Color-coded urgency (green → yellow → orange → red)
- Pulsing alert for accounts decaying in ≤2 days
- Sort by urgency or name
- "Played" on every account records one ranked game: +7 banked days for Diamond (cap 28), +1 for Master/Grandmaster/Challenger (cap 14). Expired timers start banking from today.
- Rank tier emblem icons
- Optional account sign-in (email/password or Google) for cross-device sync — the app works fully without one, storing data locally in your browser instead
- Per-user data isolation via Postgres Row Level Security

## Tech stack

- [Next.js](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) — Auth (email/password + Google OAuth) and Postgres storage
- [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/) for form validation
- Deployed on [Vercel](https://vercel.com/)

## Run locally

```bash
npm install
```

Create a `.env.local` file with your Supabase project credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

```bash
npm run dev
```

The app runs fully in "guest mode" (local browser storage) without a Supabase account — the env vars are only needed for sign-in and cross-device sync.

## Deploy to Vercel

Before deploying the legal acceptance feature, follow [LEGAL-ROLLOUT.md](LEGAL-ROLLOUT.md):
review the operator/provider details and apply the included Supabase migration
before releasing the application. Registration and Google onboarding depend on it.

Connect the GitHub repo at [vercel.com](https://vercel.com) for automatic deploys, or:

```bash
vercel
```

Remember to add the same `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` variables in the Vercel project settings, and add your production URL to the Supabase project's Redirect URLs (Authentication → URL Configuration).
