import type { Account } from "@/lib/types/account";

// Build fresh examples for each visit/reset; no fixed dates that go stale.
export function createDemoAccounts(now = new Date()): Account[] {
  const timestamp = now.toISOString();
  const examples: { id: string; riotId: string; tier: Account["tier"]; server: Account["server"]; days: number; note: string }[] = [
    { id: "demo-challenger", riotId: "NightShift#DEMO", tier: "Challenger", server: "EUW", days: 1,
      note: "One day left. Try Played to add a day to the bank." },
    { id: "demo-diamond", riotId: "WeekendGrind#DEMO", tier: "Diamond", server: "EUNE", days: 10,
      note: "One ranked game adds 7 days, up to a 28-day bank." },
    { id: "demo-master", riotId: "SafeAndSound#DEMO", tier: "Master", server: "NA", days: 14,
      note: "Full bank. Update the timer to try a different scenario." },
  ];
  return examples.map(({ days, ...example }) => {
    const date = new Date(now);
    date.setDate(date.getDate() + days);
    return { ...example, decayDate: date.toISOString(), createdAt: timestamp, lastUpdated: timestamp };
  });
}
