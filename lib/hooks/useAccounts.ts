// FILE: lib/hooks/useAccounts.ts

import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Account } from "@/lib/types/account";
import {
  clearLocalAccounts,
  hasLocalAccounts,
  loadLocalAccounts,
  saveLocalAccounts,
} from "@/lib/accounts/local";
import {
  importAccountsToRemote,
  loadRemoteAccounts,
  syncRemoteAccounts,
} from "@/lib/accounts/remote";

export function useAccounts() {
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [accounts, setAccountsState] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Ci mame usera vidiet ponuku na import z localStorage
  const [importAvailable, setImportAvailable] = useState(false);
  const [importing, setImporting] = useState(false);

  // Drzime si posledny "odoslany" stav, aby persist() vedel spravit diff
  const previousRef = useRef<Account[]>([]);

  // 1) Zisti, ci je niekto prihlaseny (a sleduj zmeny - login/logout)
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthChecked(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // 2) Nacitaj ucty podla toho, ci je user prihlaseny alebo nie
  useEffect(() => {
    if (!authChecked) return;

    let cancelled = false;

    async function load() {
      setLoading(true);

      if (user) {
        const remote = await loadRemoteAccounts(supabase, user.id);
        if (cancelled) return;
        previousRef.current = remote;
        setAccountsState(remote);

        // Ponukni import len ak lokalne data existuju
        setImportAvailable(hasLocalAccounts());
      } else {
        const local = loadLocalAccounts();
        if (cancelled) return;
        previousRef.current = local;
        setAccountsState(local);
        setImportAvailable(false);
      }

      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [authChecked, user, supabase]);

  // 3) persist() - rovnake API ako predtym (posli cely novy zoznam),
  // len vnutri routuje na localStorage alebo Supabase
  const persist = useCallback(
    async (next: Account[]) => {
      setAccountsState(next);

      if (user) {
        await syncRemoteAccounts(supabase, user.id, previousRef.current, next);
      } else {
        saveLocalAccounts(next);
      }

      previousRef.current = next;
    },
    [user, supabase]
  );

  const confirmImport = useCallback(async () => {
    if (!user) return;
    setImporting(true);

    const local = loadLocalAccounts();
    await importAccountsToRemote(supabase, user.id, local);

    const remote = await loadRemoteAccounts(supabase, user.id);
    previousRef.current = remote;
    setAccountsState(remote);

    clearLocalAccounts();
    setImportAvailable(false);
    setImporting(false);
  }, [user, supabase]);

  const dismissImport = useCallback(() => {
    setImportAvailable(false);
  }, []);

  return {
    accounts,
    persist,
    loading,
    isAuthenticated: Boolean(user),
    importAvailable,
    importing,
    confirmImport,
    dismissImport,
  };
}