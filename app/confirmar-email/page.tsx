"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function ConfirmarEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Link inválido.");
      return;
    }

    fetch("/api/confirm-email-change", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setStatus("error");
          setErrorMessage(data.error || "Erro ao confirmar email.");
          return;
        }
        setStatus("success");
      })
      .catch(() => {
        setStatus("error");
        setErrorMessage("Erro ao conectar com o servidor.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0D12] px-4">
      <div className="w-full max-w-sm rounded-xl border border-[#1E242E] bg-[#12161D] p-8 text-center">
        {status === "loading" && (
          <p className="text-sm text-[#7C8494]">Confirmando seu novo email...</p>
        )}

        {status === "success" && (
          <>
            <p className="mb-4 text-sm text-[#34D399]">
              Email confirmado com sucesso! Faça login novamente com seu novo email.
            </p>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-lg bg-[#E8B04B] px-4 py-2 text-sm font-semibold text-[#0A0D12] transition hover:bg-[#F2BE63]"
            >
              Ir para o login
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <p className="mb-4 text-sm text-[#FB7185]">{errorMessage}</p>
            <Link href="/configuracoes" className="text-sm text-[#E8B04B] hover:underline">
              Voltar para Configurações
            </Link>
          </>
        )}
      </div>
    </div>
  );
}