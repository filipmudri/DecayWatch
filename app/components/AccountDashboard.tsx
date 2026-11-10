"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ImportBanner } from "@/app/components/ImportBanner";
import type { Account, Tier, Server, AccountStore } from "@/lib/types/account";
import { AuthStatus } from "@/app/components/AuthStatus";
import { rankIcon } from "@/lib/rankIcon";
import { AccountFooterLink } from "@/app/components/AccountFooterLink";
import { DECAY_RULES, daysUntilDecay, recordPlayed } from "@/lib/accounts/decay";

const SERVERS: Server[] = [
  "EUW", "EUNE", "NA", "KR", "BR", "LAN", "LAS",
  "TR", "RU", "OCE", "JP", "ME", "SEA", "TW", "VN",
];
const TIERS: Tier[] = ["Diamond", "Master", "Grandmaster", "Challenger"];

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function daysUntil(dateStr: string): number {
  return daysUntilDecay(dateStr);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function urgencyColor(days: number): string {
  if (days <= 2) return "#E05252";
  if (days <= 5) return "#E07B2A";
  if (days <= 10) return "#C8A84B";
  return "#4CAF74";
}

function urgencyLabel(days: number): string {
  if (days < 0) return "DECAYED";
  if (days === 0) return "TODAY";
  if (days === 1) return "TOMORROW";
  if (days <= 5) return "URGENT";
  if (days <= 10) return "SOON";
  return "SAFE";
}

function tierColor(tier: Tier): string {
  const c: Record<Tier, string> = {
    Diamond: "#5BC5F2",
    Master: "#9B59B6",
    Grandmaster: "#E05252",
    Challenger: "#C8A84B",
  };
  return c[tier];
}

export function AccountDashboard({ store, demo = false, demoReturnToAccounts = false, onResetDemo }: { store: AccountStore; demo?: boolean; demoReturnToAccounts?: boolean; onResetDemo?: () => void }) {
  const { accounts,
    persist,
    loading,
    importAvailable,
    importing,
    confirmImport,
    dismissImport, } = store;

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"urgency" | "name">("urgency");
  const [riotId, setRiotId] = useState("");
  const [server, setServer] = useState<Server>("EUW");
  const [tier, setTier] = useState<Tier>("Diamond");
  const [daysLeft, setDaysLeft] = useState("");
  const [note, setNote] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const playingRef = useRef(false);
  const [playNotice, setPlayNotice] = useState<{ message: string; failed: boolean } | null>(null);

  function resetForm() {
    setRiotId(""); setServer("EUW"); setTier("Diamond");
    setDaysLeft(""); setNote(""); setEditId(null);
  }

  function openAdd() { setPlayNotice(null); resetForm(); setShowForm(true); }

  function openEdit(acc: Account) {
    setPlayNotice(null);
    setRiotId(acc.riotId);
    setServer(acc.server);
    setTier(acc.tier);
    const d = daysUntil(acc.decayDate);
    setDaysLeft(String(d >= 0 ? d : 0));
    setNote(acc.note ?? "");
    setEditId(acc.id);
    setShowForm(true);
  }

  function handleSubmit() {
    if (playingRef.current) return;
    const days = parseInt(daysLeft);
    if (!riotId.trim() || isNaN(days) || days < 0) return;
    const decayDate = addDays(new Date(), days).toISOString();
    const now = new Date().toISOString();

    if (editId) {
      persist(accounts.map(a =>
        a.id === editId
          ? { ...a, riotId: riotId.trim(), server, tier, decayDate, note: note.trim(), lastUpdated: now }
          : a
      ));
    } else {
      const newAcc: Account = {
        id: demo ? `demo-${Date.now()}-${Math.random().toString(36).slice(2)}` : crypto.randomUUID(),
        riotId: riotId.trim(),
        server,
        tier,
        decayDate,
        note: note.trim(),
        createdAt: now,
        lastUpdated: now,
      };
      persist([...accounts, newAcc]);
    }
    setShowForm(false);
    resetForm();
  }

  function handleDelete(id: string) {
    if (playingRef.current) return;
    if (demo || confirm("Remove this account?")) persist(accounts.filter(a => a.id !== id));
  }

  async function handlePlayed(acc: Account) {
    if (playingRef.current || loading || importing) return;
    const updated = recordPlayed(acc);
    if (updated === acc) return;
    playingRef.current = true;
    setPlayingId(acc.id);
    setPlayNotice(null);
    try {
      await persist(accounts.map((account) => account.id === acc.id ? updated : account), { optimistic: false });
      setPlayNotice({ message: `Match recorded for ${acc.riotId}. Bank: ${daysUntil(updated.decayDate)} / ${DECAY_RULES[acc.tier].maxBankedDays} days.`, failed: false });
    } catch {
      setPlayNotice({ message: "Couldn't save the played match. Please try again.", failed: true });
    } finally {
      playingRef.current = false;
      setPlayingId(null);
    }
  }

  const sorted = [...accounts].sort((a, b) => {
    if (sortBy === "urgency") return daysUntil(a.decayDate) - daysUntil(b.decayDate);
    return a.riotId.localeCompare(b.riotId);
  });

  const decayingSoon = accounts.filter(a => daysUntil(a.decayDate) <= 5).length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--blue-dark)", padding: "0" }}>
      {/* Header */}
      <div className="dashboard-header" style={{
        borderBottom: "1px solid var(--blue-border)",
        padding: "24px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: "var(--gold-gradient)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 700, color: "var(--on-gold)", flexShrink: 0,
          }}>⚔</div>
          <div>
            <div className="dashboard-brand">
              DECAY<span className="dashboard-brand-accent">WATCH</span> {demo && <span className="demo-badge">DEMO</span>}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
              {accounts.length} account{accounts.length !== 1 ? "s" : ""} tracked
              {decayingSoon > 0 && (
                <span style={{ color: "#E05252", marginLeft: 8 }}>
                  · {decayingSoon} decaying soon
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-actions">
          {!demo && <Link href="/demo" prefetch={false} className="demo-link">Try demo</Link>}
          <div className="dashboard-sort" style={{
            display: "flex", background: "var(--blue-panel)",
            border: "1px solid var(--blue-border)", borderRadius: 8, overflow: "hidden",
          }}>
            {(["urgency", "name"] as const).map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                style={{
                  padding: "7px 14px", fontSize: 12, fontWeight: 500,
                  background: sortBy === s ? "var(--violet-soft)" : "transparent",
                  color: sortBy === s ? "var(--violet)" : "var(--text-secondary)",
                  border: "none", cursor: "pointer",
                  textTransform: "capitalize", fontFamily: "inherit",
                }}
              >
                {s === "urgency" ? "Most urgent" : "Name"}
              </button>
            ))}
          </div>
          <button
            onClick={openAdd}
            className="gold-action"
            disabled={playingId !== null}
            style={{
              padding: "8px 18px", fontSize: 13, fontWeight: 600,
              background: "var(--gold-gradient)",
              color: "var(--on-gold)", border: "none", borderRadius: 8,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            + Add account
          </button>
          <div className="dashboard-session">
            {demo ? (
              <Link href={demoReturnToAccounts ? "/" : "/register"} prefetch={false} className="demo-link">
                {demoReturnToAccounts ? "← Back to my accounts" : "Create your account →"}
              </Link>
            ) : <AuthStatus />}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 20px" }}>
        {demo && (
          <section aria-label="Demo mode" className="demo-banner">
            <div>
              <p className="demo-eyebrow">NO SIGN-UP REQUIRED</p>
              <h1>Meet your next decay-free week.</h1>
              <p>Three fictional accounts, one dashboard. Try <strong>Played</strong>, adjust a timer, or add an account of your own.</p>
              <p className="demo-disclaimer">You’re in a demo playground. Changes are temporary and reset when you refresh or leave. Your real accounts stay separate.</p>
            </div>
            <div className="demo-banner-actions">
              <button type="button" disabled={playingId !== null} onClick={() => {
                if (playingRef.current) return;
                onResetDemo?.(); resetForm(); setShowForm(false); setPlayNotice(null);
              }}>Reset demo</button>
              <Link href="/" prefetch={false}>Exit demo</Link>
            </div>
          </section>
        )}
        {playNotice && (
          <p role={playNotice.failed ? "alert" : "status"} style={{ marginBottom: 16, fontSize: 13, color: playNotice.failed ? "var(--red)" : "var(--green)" }}>
            {playNotice.message}
          </p>
        )}

        {/* Empty state */}
        {accounts.length === 0 && !showForm && (
          <div style={{
            textAlign: "center", padding: "80px 24px",
            color: "var(--text-secondary)",
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛡️</div>
            <div style={{ fontSize: 16, fontWeight: 500, color: "var(--text-primary)", marginBottom: 8 }}>
              No accounts tracked yet
            </div>
            <div style={{ fontSize: 14, marginBottom: 24 }}>
              Add your Diamond+ accounts to keep an eye on decay timers.
            </div>
            <button
              onClick={openAdd}
              style={{
                padding: "10px 24px", fontSize: 14, fontWeight: 600,
                background: "var(--gold-gradient)",
                color: "var(--on-gold)", border: "none", borderRadius: 8,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Add first account
            </button>
          </div>
        )}

        {/* Account cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sorted.map(acc => {
            const days = daysUntil(acc.decayDate);
            const color = urgencyColor(days);
            const label = urgencyLabel(days);
            const isUrgent = days <= 2;
            const isDecayed = days < 0;
            const { daysPerGame, maxBankedDays } = DECAY_RULES[acc.tier];
            const bankFull = days >= maxBankedDays;
            const playedDisabled = bankFull || loading || importing || playingId !== null;

            return (
              <div
                key={acc.id}
                className={isUrgent ? "card-enter urgent" : "card-enter"}
                style={{
                  background: "var(--blue-panel)",
                  border: `1px solid ${isUrgent ? color + "66" : "var(--blue-border)"}`,
                  borderRadius: 12,
                  padding: "18px 20px",
                  display: "flex", alignItems: "center",
                  gap: 16, flexWrap: "wrap",
                }}
              >
                {/* Urgency bar */}
                <div style={{
                  width: 4, height: 52, borderRadius: 4,
                  background: color, flexShrink: 0,
                }} />

                {/* Rank Emblem (Fixed 52x52 box on the left) */}
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: 10,
                  //background: "rgba(0, 0, 0, 0.2)",
                  //border: "1px solid var(--blue-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={rankIcon(acc.tier)}
                    alt={acc.tier}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      transform: "scale(4)", // Zoomne ikonku bez rozhadzovania okrajov
                    }}
                  />
                </div>

                {/* Main info */}
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
                      {acc.riotId}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "2px 7px",
                      borderRadius: 4, background: "var(--blue-border)",
                      color: "var(--text-secondary)",
                    }}>{acc.server}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "2px 7px",
                      borderRadius: 4, background: tierColor(acc.tier) + "22",
                      color: tierColor(acc.tier),
                    }}>{acc.tier}</span>
                  </div>
                  {acc.note && (
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>
                      {acc.note}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                    Decays {formatDate(acc.decayDate)} · updated {new Date(acc.lastUpdated).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>
                    Bank: {Math.max(0, days)} / {maxBankedDays} days
                  </div>
                </div>

                {/* Days counter */}
                <div style={{ textAlign: "center", minWidth: 80 }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>
                    {isDecayed ? "✗" : days}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color, marginTop: 4, letterSpacing: "0.08em" }}>
                    {isDecayed ? "DECAYED" : days === 1 ? "DAY LEFT" : days === 0 ? "TODAY" : "DAYS LEFT"}
                  </div>
                  <div style={{
                    marginTop: 6, fontSize: 9, fontWeight: 700,
                    letterSpacing: "0.1em", padding: "2px 6px",
                    borderRadius: 3, background: color + "22",
                    color,
                  }}>
                    {label}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button
                    type="button"
                    className="played-action"
                    onClick={() => void handlePlayed(acc)}
                    disabled={playedDisabled}
                    title={bankFull ? `Bank full: ${maxBankedDays} days` : `Record one ranked game: +${daysPerGame} ${daysPerGame === 1 ? "day" : "days"}, up to ${maxBankedDays} days`}
                    style={{
                      padding: "8px 12px", fontSize: 12, fontWeight: 600,
                      background: "var(--violet-soft)", color: "var(--violet)",
                      border: "1px solid var(--violet-border)", borderRadius: 6,
                      cursor: playedDisabled ? "not-allowed" : "pointer", fontFamily: "inherit",
                      opacity: playedDisabled ? 0.5 : 1,
                    }}
                  >
                    {playingId === acc.id ? "Saving..." : bankFull ? "Played · Bank full" : `Played · +${daysPerGame} ${daysPerGame === 1 ? "day" : "days"}`}
                  </button>
                  <button
                    onClick={() => openEdit(acc)}
                    disabled={playingId !== null}
                    style={{
                      padding: "6px 12px", fontSize: 12, fontWeight: 500,
                      background: "var(--blue-border)", color: "var(--text-primary)",
                      border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    Update timer
                  </button>
                  <button
                    onClick={() => handleDelete(acc.id)}
                    disabled={playingId !== null}
                    style={{
                      padding: "6px 12px", fontSize: 12, fontWeight: 500,
                      background: "transparent", color: "var(--text-secondary)",
                      border: "1px solid var(--blue-border)", borderRadius: 6,
                      cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Decay info footer */}
        {accounts.length > 0 && (
          <div style={{
            marginTop: 32, padding: "16px 20px",
            background: "var(--blue-panel)", border: "1px solid var(--blue-border)",
            borderRadius: 10, fontSize: 12, color: "var(--text-secondary)",
            display: "flex", gap: 24, flexWrap: "wrap",
          }}>
            <span>💎 Diamond — Loses <b style={{color:"#5BC5F2"}}>50 LP/day</b> once banked days hit 0 (1 match = 7 banked days, max 28)</span>
            <span>💜 Master — Loses <b style={{color:"#9B59B6"}}>75 LP/day</b> once banked days hit 0 (1 match = 1 banked day, max 14)</span>
            <span>🔴 Grandmaster — Loses <b style={{color:"#E05252"}}>75 LP/day</b> once banked days hit 0 (1 match = 1 banked day, max 14)</span>
            <span>🏆 Challenger — Loses <b style={{color:"#C8A84B"}}>75 LP/day</b> once banked days hit 0 (1 match = 1 banked day, max 14)</span>
          </div>
        )}
      </div>

      <div style={{
        width: "100%", display: "flex", justifyContent: "flex-end",
        padding: "0 32px 24px",
      }}>
        {!demo && <AccountFooterLink />}
      </div>

      {/* Modal / Form */}
      {showForm && (
        <div
          onClick={e => { if (e.target === e.currentTarget) { setShowForm(false); resetForm(); } }}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 50, padding: 20,
          }}
        >
          <div style={{
            background: "var(--blue-mid)",
            border: "1px solid var(--blue-border)",
            borderRadius: 16, padding: 28,
            width: "100%", maxWidth: 440,
            boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
          }}>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 20, color: "var(--gold)" }}>
              {editId ? "Update account" : "Add account"}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                  Riot ID (Name#Tag)
                </label>
                <input
                  value={riotId}
                  onChange={e => setRiotId(e.target.value)}
                  placeholder="Faker#KR1"
                  style={{
                    width: "100%", padding: "10px 12px",
                    background: "var(--blue-dark)", border: "1px solid var(--blue-border)",
                    borderRadius: 8, color: "var(--text-primary)", fontSize: 14,
                    fontFamily: "inherit", boxSizing: "border-box", outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                    Server
                  </label>
                  <select
                    value={server}
                    onChange={e => setServer(e.target.value as Server)}
                    style={{
                      width: "100%", padding: "10px 12px",
                      background: "var(--blue-dark)", border: "1px solid var(--blue-border)",
                      borderRadius: 8, color: "var(--text-primary)", fontSize: 14,
                      fontFamily: "inherit", outline: "none",
                    }}
                  >
                    {SERVERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                    Tier
                  </label>
                  <select
                    value={tier}
                    onChange={e => setTier(e.target.value as Tier)}
                    style={{
                      width: "100%", padding: "10px 12px",
                      background: "var(--blue-dark)", border: "1px solid var(--blue-border)",
                      borderRadius: 8, color: "var(--text-primary)", fontSize: 14,
                      fontFamily: "inherit", outline: "none",
                    }}
                  >
                    {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                  Days until decay <span style={{ color: "var(--text-secondary)" }}>(from in-game timer)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="28"
                  value={daysLeft}
                  onChange={e => setDaysLeft(e.target.value)}
                  placeholder="e.g. 10"
                  style={{
                    width: "100%", padding: "10px 12px",
                    background: "var(--blue-dark)", border: "1px solid var(--blue-border)",
                    borderRadius: 8, color: "var(--text-primary)", fontSize: 14,
                    fontFamily: "inherit", boxSizing: "border-box", outline: "none",
                  }}
                />
                {daysLeft && !isNaN(parseInt(daysLeft)) && (
                  <div style={{ fontSize: 12, color: "var(--gold)", marginTop: 6 }}>
                    → Decays on {formatDate(addDays(new Date(), parseInt(daysLeft)).toISOString())}
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                  Note <span style={{ color: "var(--text-secondary)" }}>(optional)</span>
                </label>
                <input
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="main, smurf, etc."
                  style={{
                    width: "100%", padding: "10px 12px",
                    background: "var(--blue-dark)", border: "1px solid var(--blue-border)",
                    borderRadius: 8, color: "var(--text-primary)", fontSize: 14,
                    fontFamily: "inherit", boxSizing: "border-box", outline: "none",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button
                onClick={() => { setShowForm(false); resetForm(); }}
                style={{
                  flex: 1, padding: "11px", fontSize: 13, fontWeight: 500,
                  background: "var(--blue-dark)", color: "var(--text-secondary)",
                  border: "1px solid var(--blue-border)", borderRadius: 8,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={playingId !== null || !riotId.trim() || isNaN(parseInt(daysLeft))}
                style={{
                  flex: 2, padding: "11px", fontSize: 13, fontWeight: 600,
                  background: "var(--gold-gradient)",
                  color: "var(--on-gold)", border: "none", borderRadius: 8,
                  cursor: "pointer", fontFamily: "inherit",
                  opacity: !riotId.trim() || isNaN(parseInt(daysLeft)) ? 0.5 : 1,
                }}
              >
                {editId ? "Save changes" : "Add account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {importAvailable && (
        <ImportBanner
          importing={importing}
          onConfirm={() => { if (!playingRef.current) void confirmImport(); }}
          onDismiss={dismissImport}
        />
      )}

      {loading && (
        <div style={{ padding: "24px 32px", color: "var(--text-secondary)", fontSize: 13 }}>
          Loading accounts...
        </div>
      )}
    </div>
  );
}
