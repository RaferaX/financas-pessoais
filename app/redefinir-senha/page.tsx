"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function RedefinirSenhaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (!token) {
      setError("Link inválido.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao redefinir senha.");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  if (!token) {
    return (
      <div className="w-full max-w-sm rounded-xl border border-[#1E242E] bg-[#12161D] p-8 text-center">
        <p className="text-sm text-[#FB7185]">Link inválido ou incompleto.</p>
        <Link href="/esqueci-senha" className="mt-4 inline-block text-sm text-[#E8B04B] hover:underline">
          Solicitar novo link
        </Link>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-sm rounded-xl border border-[#1E242E] bg-[#12161D] p-8">
      <h1 className="mb-1 [font-family:var(--font-display)] text-2xl font-semibold text-[#EDEFF2]">
        Nova senha
      </h1>
      <p className="mb-6 text-sm text-[#7C8494]">
        Defina uma nova senha para sua conta.
      </p>

      {success ? (
        <div className="rounded-lg border border-[#34D399]/30 bg-[#34D399]/10 px-4 py-3 text-sm text-[#34D399]">
          Senha redefinida com sucesso! Redirecionando para o login...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-[#FB7185]/30 bg-[#FB7185]/10 px-4 py-3 text-sm text-[#FB7185]">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm text-[#7C8494]">Nova senha</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-[#1E242E] bg-[#0A0D12] px-4 py-2 text-[#EDEFF2] outline-none focus:border-[#E8B04B]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-[#7C8494]">Confirmar nova senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-[#1E242E] bg-[#0A0D12] px-4 py-2 text-[#EDEFF2] outline-none focus:border-[#E8B04B]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#E8B04B] py-2 text-sm font-semibold text-[#0A0D12] transition hover:bg-[#F2BE63] disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Redefinir senha"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0D12] px-4">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,_rgba(232,176,75,0.08),_transparent_70%)]" />
      <Suspense
        fallback={
          <div className="w-full max-w-sm rounded-xl border border-[#1E242E] bg-[#12161D] p-8 text-center">
            <p className="text-sm text-[#7C8494]">Carregando...</p>
          </div>
        }
      >
        <RedefinirSenhaContent />
      </Suspense>
    </div>
  );
}