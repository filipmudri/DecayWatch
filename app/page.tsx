"use client";

import { useState, useEffect, useCallback } from "react";

type Tier = "Diamond" | "Master" | "Grandmaster" | "Challenger";
type Server =
  | "EUW" | "EUNE" | "NA" | "KR" | "BR" | "LAN" | "LAS"
  | "TR" | "RU" | "OCE" | "JP" | "ME" | "SEA" | "TW" | "VN";

interface Account {
  id: string;
  riotId: string;
  server: Server;
  tier: Tier;
  decayDate: string; // ISO date string
  note?: string;
  createdAt: string;
  lastUpdated: string;
}

const DECAY_INTERVAL: Record<Tier, number> = {
  Diamond: 28,
  Master: 14,
  Grandmaster: 14,
  Challenger: 14,
};

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
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
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

export default function Home() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"urgency" | "name">("urgency");

  // Form state
  const [riotId, setRiotId] = useState("");
  const [server, setServer] = useState<Server>("EUW");
  const [tier, setTier] = useState<Tier>("Diamond");
  const [daysLeft, setDaysLeft] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("lol-decay-accounts");
    if (stored) {
      try { setAccounts(JSON.parse(stored)); } catch {}
    }
  }, []);

  const persist = useCallback((accs: Account[]) => {
    setAccounts(accs);
    localStorage.setItem("lol-decay-accounts", JSON.stringify(accs));
  }, []);

  function resetForm() {
    setRiotId(""); setServer("EUW"); setTier("Diamond");
    setDaysLeft(""); setNote(""); setEditId(null);
  }

  function openAdd() { resetForm(); setShowForm(true); }

  function openEdit(acc: Account) {
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
        id: crypto.randomUUID(),
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
    if (confirm("Remove this account?")) persist(accounts.filter(a => a.id !== id));
  }

  function refreshAfterDecay(acc: Account) {
    const interval = DECAY_INTERVAL[acc.tier];
    const newDate = addDays(new Date(acc.decayDate), interval).toISOString();
    persist(accounts.map(a =>
      a.id === acc.id
        ? { ...a, decayDate: newDate, lastUpdated: new Date().toISOString() }
        : a
    ));
  }

  const sorted = [...accounts].sort((a, b) => {
    if (sortBy === "urgency") return daysUntil(a.decayDate) - daysUntil(b.decayDate);
    return a.riotId.localeCompare(b.riotId);
  });

  const decayingSoon = accounts.filter(a => daysUntil(a.decayDate) <= 5).length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--blue-dark)", padding: "0" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(180deg, #0D1426 0%, #0A0E1A 100%)",
        borderBottom: "1px solid var(--blue-border)",
        padding: "24px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: "linear-gradient(135deg, #C8A84B, #8A6F2E)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 700, color: "#0A0E1A", flexShrink: 0,
          }}>⚔</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--gold)", letterSpacing: "0.02em" }}>
              Decay Tracker
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

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{
            display: "flex", background: "var(--blue-panel)",
            border: "1px solid var(--blue-border)", borderRadius: 8, overflow: "hidden",
          }}>
            {(["urgency", "name"] as const).map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                style={{
                  padding: "7px 14px", fontSize: 12, fontWeight: 500,
                  background: sortBy === s ? "var(--blue-border)" : "transparent",
                  color: sortBy === s ? "var(--text-primary)" : "var(--text-secondary)",
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
            style={{
              padding: "8px 18px", fontSize: 13, fontWeight: 600,
              background: "linear-gradient(135deg, #C8A84B, #8A6F2E)",
              color: "#0A0E1A", border: "none", borderRadius: 8,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            + Add account
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "28px 20px" }}>

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
                background: "linear-gradient(135deg, #C8A84B, #8A6F2E)",
                color: "#0A0E1A", border: "none", borderRadius: 8,
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

                {/* Main info */}
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
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
                    onClick={() => openEdit(acc)}
                    style={{
                      padding: "6px 12px", fontSize: 12, fontWeight: 500,
                      background: "var(--blue-border)", color: "var(--text-primary)",
                      border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    Update timer
                  </button>
                  {isDecayed && (
                    <button
                      onClick={() => refreshAfterDecay(acc)}
                      style={{
                        padding: "6px 12px", fontSize: 12, fontWeight: 500,
                        background: "#4CAF7422", color: "#4CAF74",
                        border: "1px solid #4CAF7444", borderRadius: 6,
                        cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      Mark played
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(acc.id)}
                    style={{
                      padding: "6px 12px", fontSize: 12, fontWeight: 500,
                      background: "transparent", color: "#E0525266",
                      border: "1px solid #E0525222", borderRadius: 6,
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
                  Days until decay <span style={{ color: "#8B9BB4" }}>(from in-game timer)</span>
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
                  Note <span style={{ color: "#8B9BB4" }}>(optional)</span>
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
                disabled={!riotId.trim() || isNaN(parseInt(daysLeft))}
                style={{
                  flex: 2, padding: "11px", fontSize: 13, fontWeight: 600,
                  background: "linear-gradient(135deg, #C8A84B, #8A6F2E)",
                  color: "#0A0E1A", border: "none", borderRadius: 8,
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
    </div>
  );
}
