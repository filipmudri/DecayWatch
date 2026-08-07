// FILE: lib/accounts/local.ts

import type { Account } from "@/lib/types/account";

const STORAGE_KEY = "lol-decay-accounts";

export function loadLocalAccounts(): Account[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as Account[];
  } catch {
    return [];
  }
}

export function saveLocalAccounts(accounts: Account[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

export function clearLocalAccounts(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function hasLocalAccounts(): boolean {
  return loadLocalAccounts().length > 0;
}