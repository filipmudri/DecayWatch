// FILE: lib/accounts/remote.ts

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Account, Tier } from "@/lib/types/account";

interface DecayData {
  tier: Tier;
  decayDate: string;
  note?: string;
}

interface TrackedAccountRow {
  id: string;
  user_id: string;
  summoner_name: string;
  region: string;
  decay_data: DecayData;
  created_at: string;
  updated_at: string;
}

function rowToAccount(row: TrackedAccountRow): Account {
  return {
    id: row.id,
    riotId: row.summoner_name,
    server: row.region as Account["server"],
    tier: row.decay_data.tier,
    decayDate: row.decay_data.decayDate,
    note: row.decay_data.note,
    createdAt: row.created_at,
    lastUpdated: row.updated_at,
  };
}

export async function loadRemoteAccounts(
  supabase: SupabaseClient,
  userId: string
): Promise<Account[]> {
  const { data, error } = await supabase
    .from("tracked_accounts")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return (data as TrackedAccountRow[]).map(rowToAccount);
}

/**
 * Zosynchronizuje cely zoznam uctov s DB - porovna stary a novy stav
 * a spravi presne tie insert/update/delete operacie, ktore su potrebne.
 * Vdaka tomu moze zvysok appky volat persist(celyNovyZoznam) rovnako,
 * ako to robil doteraz s localStorage, bez ohladu na to, ci beh na DB.
 */
export async function syncRemoteAccounts(
  supabase: SupabaseClient,
  userId: string,
  previous: Account[],
  next: Account[]
): Promise<void> {
  const previousIds = new Set(previous.map((a) => a.id));
  const nextIds = new Set(next.map((a) => a.id));

  const toDelete = previous.filter((a) => !nextIds.has(a.id));
  const toInsert = next.filter((a) => !previousIds.has(a.id));
  const toUpdate = next.filter((a) => {
    if (!previousIds.has(a.id)) return false;
    const prev = previous.find((p) => p.id === a.id);
    return prev && JSON.stringify(prev) !== JSON.stringify(a);
  });

  if (toDelete.length > 0) {
    const { error } = await supabase
      .from("tracked_accounts")
      .delete()
      .in(
        "id",
        toDelete.map((a) => a.id)
      );
    if (error) throw error;
  }

  if (toInsert.length > 0) {
    const { error } = await supabase.from("tracked_accounts").insert(
      toInsert.map((a) => accountToRow(a, userId))
    );
    if (error) throw error;
  }

  for (const acc of toUpdate) {
    const { error } = await supabase
      .from("tracked_accounts")
      .update(accountToRow(acc, userId))
      .eq("id", acc.id);
    if (error) throw error;
  }
}

function accountToRow(account: Account, userId: string) {
  return {
    id: account.id,
    user_id: userId,
    summoner_name: account.riotId,
    region: account.server,
    decay_data: {
      tier: account.tier,
      decayDate: account.decayDate,
      note: account.note,
    } satisfies DecayData,
    updated_at: account.lastUpdated,
  };
}

/**
 * Hromadny import z localStorage pri prvom prihlaseni.
 * Pouziva nove UUID pre kazdy ucet (povodne id z localStorage
 * nie je garantovane platne DB uuid).
 */
export async function importAccountsToRemote(
  supabase: SupabaseClient,
  userId: string,
  accounts: Account[]
): Promise<void> {
  if (accounts.length === 0) return;

  const rows = accounts.map((a) => ({
    ...accountToRow({ ...a, id: crypto.randomUUID() }, userId),
    created_at: a.createdAt,
  }));

  const { error } = await supabase.from("tracked_accounts").insert(rows);
  if (error) throw error;
}