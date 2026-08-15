"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerificarEmailContent() {
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

    fetch("/api/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setStatus("error");
          setErrorMessage(data.error || "Erro ao verificar email.");
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
    <div className="w-full max-w-sm rounded-xl border border-[#1E242E] bg-[#12161D] p-8 text-center">
      {status === "loading" && (
        <p className="text-sm text-[#7C8494]">Verificando seu email...</p>
      )}

      {status === "success" && (
        <>
          <p className="mb-4 text-sm text-[#34D399]">
            Email verificado com sucesso! Você já pode fazer login.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-lg bg-[#E8B04B] px-4 py-2 text-sm font-semibold text-[#0A0D12] transition hover:bg-[#F2BE63]"
          >
            Ir para o login
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <p className="mb-4 text-sm text-[#FB7185]">{errorMessage}</p>
          <Link href="/login" className="text-sm text-[#E8B04B] hover:underline">
            Voltar para o login
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerificarEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0D12] px-4">
      <Suspense
        fallback={
          <div className="w-full max-w-sm rounded-xl border border-[#1E242E] bg-[#12161D] p-8 text-center">
            <p className="text-sm text-[#7C8494]">Carregando...</p>
          </div>
        }
      >
        <VerificarEmailContent />
      </Suspense>
    </div>
  );
}