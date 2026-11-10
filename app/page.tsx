"use client";

import { AccountDashboard } from "@/app/components/AccountDashboard";
import { useAccounts } from "@/lib/hooks/useAccounts";

export default function Home() {
  const store = useAccounts();
  return <AccountDashboard store={store} />;
}
