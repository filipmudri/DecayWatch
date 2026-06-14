# LoL Decay Tracker

Track ranked decay timers across all your Diamond+ League of Legends accounts.

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

- Track multiple accounts across all servers
- Color-coded urgency (green → yellow → orange → red)
- Pulsing alert for accounts decaying in ≤2 days
- Sort by urgency or name
- "Mark played" button auto-schedules next decay after one fires
- All data stored locally in your browser (no backend, no accounts needed)

## Deploy to Vercel

```bash
npm install
vercel
```

Or connect your GitHub repo at [vercel.com](https://vercel.com) and it deploys automatically.

## Run locally

```bash
npm install
npm run dev
```
