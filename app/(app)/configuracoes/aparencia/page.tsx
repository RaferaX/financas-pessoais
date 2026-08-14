"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function AparenciaPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const options = [
    { value: "dark", label: "Escuro", bg: "#0A0D12", panel: "#12161D" },
    { value: "light", label: "Claro", bg: "#F7F8FA", panel: "#FFFFFF" },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <a
          href="/configuracoes"
          className="mb-1 inline-block text-[11px] uppercase tracking-[0.2em] text-[var(--text-faint)] hover:text-[var(--text-hi)]"
        >
          ← Configurações
        </a>
        <h1 className="mb-6 [font-family:var(--font-display)] text-2xl font-semibold text-[var(--text-hi)]">
          Aparência
        </h1>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6">
          <h2 className="mb-4 [font-family:var(--font-display)] text-base font-semibold text-[var(--text-hi)]">
            Tema
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`rounded-xl border p-4 text-left transition ${
                  theme === opt.value
                    ? "border-[var(--gold)]"
                    : "border-[var(--border)] hover:border-[var(--border-hover)]"
                }`}
              >
                <div
                  className="mb-3 h-16 w-full rounded-lg border"
                  style={{ backgroundColor: opt.bg, borderColor: opt.panel }}
                >
                  <div
                    className="m-2 h-8 w-2/3 rounded"
                    style={{ backgroundColor: opt.panel }}
                  />
                </div>
                <p className="text-sm font-medium text-[var(--text-hi)]">{opt.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}