import type { Account, Tier } from "@/lib/types/account";

export const DECAY_RULES: Record<Tier, { daysPerGame: number; maxBankedDays: number }> = {
  Diamond: { daysPerGame: 7, maxBankedDays: 28 },
  Master: { daysPerGame: 1, maxBankedDays: 14 },
  Grandmaster: { daysPerGame: 1, maxBankedDays: 14 },
  Challenger: { daysPerGame: 1, maxBankedDays: 14 },
};

// Compare local calendar days, including across daylight-saving changes.
export function daysUntilDecay(date: string, now = new Date()): number {
  const target = new Date(date);
  const day = (value: Date) => Date.UTC(value.getFullYear(), value.getMonth(), value.getDate());
  return Math.round((day(target) - day(now)) / 86_400_000);
}

export function recordPlayed(account: Account, now = new Date()): Account {
  const { daysPerGame, maxBankedDays } = DECAY_RULES[account.tier];
  const remaining = Math.max(0, daysUntilDecay(account.decayDate, now));
  if (remaining >= maxBankedDays) return account;
  const bank = Math.min(remaining + daysPerGame, maxBankedDays);
  const decayDate = new Date(now);
  decayDate.setDate(decayDate.getDate() + bank);
  return { ...account, decayDate: decayDate.toISOString(), lastUpdated: now.toISOString() };
}
