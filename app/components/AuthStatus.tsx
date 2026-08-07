// FILE: app/components/AuthStatus.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export function AuthStatus() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setChecked(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.refresh();
    setSigningOut(false);
  };

  // Kym nevieme, ci je user prihlaseny, nerenderuj nic - zabranime
  // "blikaniu" medzi "Prihlásiť sa" a emailom pri kazdom loade
  if (!checked) return null;

  if (user) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            maxWidth: 160,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={user.email ?? undefined}
        >
          {user.email}
        </span>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          style={{
            padding: "7px 14px",
            fontSize: 12,
            fontWeight: 500,
            background: "transparent",
            color: "var(--text-secondary)",
            border: "1px solid var(--blue-border)",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          {signingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    );
  }

  return (
    <a
      href="/login"
      style={{
        padding: "7px 14px",
        fontSize: 12,
        fontWeight: 600,
        background: "var(--gold)",
        color: "#0A0E1A",
        border: "none",
        borderRadius: 6,
        textDecoration: "none",
        display: "inline-block",
      }}
    >
      Log in
    </a>
  );
}