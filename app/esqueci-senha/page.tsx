"use client";

import { useState } from "react";
import Link from "next/link";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao processar solicitação.");
      return;
    }

    setSent(true);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0D12] px-4">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,_rgba(232,176,75,0.08),_transparent_70%)]" />

      <div className="relative z-10 w-full max-w-sm rounded-xl border border-[#1E242E] bg-[#12161D] p-8">
        <h1 className="mb-1 [font-family:var(--font-display)] text-2xl font-semibold text-[#EDEFF2]">
          Esqueceu sua senha?
        </h1>
        <p className="mb-6 text-sm text-[#7C8494]">
          Informe seu email e enviaremos um link para redefinir sua senha.
        </p>

        {sent ? (
          <div className="rounded-lg border border-[#34D399]/30 bg-[#34D399]/10 px-4 py-3 text-sm text-[#34D399]">
            Se esse email existir na nossa base, você vai receber um link de recuperação em instantes.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-[#FB7185]/30 bg-[#FB7185]/10 px-4 py-3 text-sm text-[#FB7185]">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm text-[#7C8494]">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-[#1E242E] bg-[#0A0D12] px-4 py-2 text-[#EDEFF2] outline-none focus:border-[#E8B04B]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#E8B04B] py-2 text-sm font-semibold text-[#0A0D12] transition hover:bg-[#F2BE63] disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar link de recuperação"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-[#7C8494]">
          Lembrou a senha?{" "}
          <Link href="/login" className="text-[#E8B04B] hover:underline">
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  );
}