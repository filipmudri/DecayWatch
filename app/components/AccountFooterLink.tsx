"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AccountFooterLink() {
  const router = useRouter();
  const supabase = createClient();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    const res = await fetch("/api/account/delete", { method: "DELETE" });
    if (res.ok) {
      await supabase.auth.signOut();
      router.push("/login");
    } else {
      setDeleting(false);
      alert("Failed to delete account, please try again.");
    }
  };

  if (confirming) {
    return (
      <div
        style={{
          fontSize: 11,
          display: "flex",
          gap: 8,
          alignItems: "center",
          background: "#DC262622",
          border: "1px solid #DC262644",
          borderRadius: 8,
          padding: "8px 14px",
        }}
      >
        <span style={{ color: "var(--text-secondary)" }}>Delete account permanently?</span>
        <button
          onClick={handleDeleteAccount}
          disabled={deleting}
          style={{ color: "#DC2626", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}
        >
          {deleting ? "Deleting..." : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={deleting}
          style={{ color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer" }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      style={{
        fontSize: 11,
        fontWeight: 500,
        color: "#DC2626",
        background: "#DC262618",
        border: "1px solid #DC262633",
        borderRadius: 8,
        padding: "8px 14px",
        cursor: "pointer",
      }}
    >
      Delete account
    </button>
  );
}