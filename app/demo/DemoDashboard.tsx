"use client";

import { useState } from "react";
import { AccountDashboard } from "@/app/components/AccountDashboard";
import { createDemoAccounts } from "@/lib/accounts/demo";
import type { Account, AccountStore } from "@/lib/types/account";

export function DemoDashboard({ initialAccounts, returnToAccounts = false }: { initialAccounts: Account[]; returnToAccounts?: boolean }) {
  const [accounts, setAccounts] = useState(initialAccounts);
  // Demo state exists only in this component: no auth, browser storage, import
  // or cloud writes. Reuse exactly the same dashboard and Played behaviour.
  const store: AccountStore = {
    accounts,
    persist: async (next) => { setAccounts(next); },
    loading: false,
    importAvailable: false,
    importing: false,
    confirmImport: async () => {},
    dismissImport: () => {},
  };
  return <AccountDashboard store={store} demo demoReturnToAccounts={returnToAccounts} onResetDemo={() => setAccounts(createDemoAccounts())} />;
}
