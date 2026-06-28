"use client";

import { useState } from "react";

export function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <input
        readOnly
        value={value}
        onFocus={(e) => e.currentTarget.select()}
        className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-2 py-1.5 text-xs text-zinc-700"
      />
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            /* Clipboard nicht verfuegbar – Nutzer kann manuell markieren */
          }
        }}
        className="shrink-0 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700"
      >
        {copied ? "Kopiert!" : "Kopieren"}
      </button>
    </div>
  );
}
