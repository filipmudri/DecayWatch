// FILE: app/components/ImportBanner.tsx
"use client";

interface ImportBannerProps {
  importing: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}

export function ImportBanner({
  importing,
  onConfirm,
  onDismiss,
}: ImportBannerProps) {
  return (
    <div
      style={{
        background: "var(--blue-panel)",
        border: "1px solid var(--blue-border)",
        borderRadius: 8,
        padding: "14px 18px",
        margin: "16px 32px 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <div style={{ fontSize: 13, color: "var(--text-primary)" }}>
        We found accounts saved in this browser. Want to import them into
        your account?
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onDismiss}
          disabled={importing}
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
          No thanks
        </button>
        <button
          onClick={onConfirm}
          disabled={importing}
          style={{
            padding: "7px 14px",
            fontSize: 12,
            fontWeight: 600,
            background: "var(--gold)",
            color: "#0A0E1A",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            opacity: importing ? 0.6 : 1,
          }}
        >
          {importing ? "Importing..." : "Import accounts"}
        </button>
      </div>
    </div>
  );
}