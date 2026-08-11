"use client";

import { useState, useEffect } from "react";

interface PatrimonioData {
  receitasDiaADia: number;
  despesasDiaADia: number;
  saldoDiaADia: number;
  totalInvestido: number;
  patrimonioTotal: number;
}

export default function PatrimonioPage() {
  const [data, setData] = useState<PatrimonioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/patrimonio")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0D12] px-4 py-10 sm:px-8">
        <p className="text-[#5B6472]">Carregando...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#0A0D12] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-[#5B6472]">Visão geral</p>
        <h1 className="mb-2 [font-family:var(--font-display)] text-2xl font-semibold text-[#EDEFF2]">
          Patrimônio
        </h1>
        <p className="mb-6 text-sm text-[#7C8494]">
          Tudo que você tem acumulado, somando dia a dia e investimentos.
        </p>

        <div className="mb-6 rounded-xl border-t-2 border-t-[#E8B04B] border-x border-b border-x-[#1E242E] border-b-[#1E242E] bg-[#12161D] p-8">
          <p className="text-sm text-[#7C8494]">Patrimônio total</p>
          <p className="mt-1 [font-family:var(--font-display)] text-4xl font-semibold tabular-nums text-[#EDEFF2]">
            {formatCurrency(data.patrimonioTotal)}
          </p>
        </div>

        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5B6472]">
          Dia a dia
        </h2>
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[#1E242E] bg-[#12161D] p-6">
            <p className="text-sm text-[#7C8494]">Receitas</p>
            <p className="mt-1 [font-family:var(--font-display)] text-xl font-semibold tabular-nums text-[#34D399]">
              {formatCurrency(data.receitasDiaADia)}
            </p>
          </div>

          <div className="rounded-xl border border-[#1E242E] bg-[#12161D] p-6">
            <p className="text-sm text-[#7C8494]">Despesas</p>
            <p className="mt-1 [font-family:var(--font-display)] text-xl font-semibold tabular-nums text-[#FB7185]">
              {formatCurrency(data.despesasDiaADia)}
            </p>
          </div>

          <div className="rounded-xl border border-[#1E242E] bg-[#12161D] p-6">
            <p className="text-sm text-[#7C8494]">Saldo</p>
            <p
              className={`mt-1 [font-family:var(--font-display)] text-xl font-semibold tabular-nums ${
                data.saldoDiaADia >= 0 ? "text-[#EDEFF2]" : "text-[#FB7185]"
              }`}
            >
              {formatCurrency(data.saldoDiaADia)}
            </p>
          </div>
        </div>

        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5B6472]">
          Investimentos
        </h2>
        <div className="rounded-xl border border-[#1E242E] bg-[#12161D] p-6">
          <p className="text-sm text-[#7C8494]">Total investido</p>
          <p className="mt-1 [font-family:var(--font-display)] text-2xl font-semibold tabular-nums text-[#E8B04B]">
            {formatCurrency(data.totalInvestido)}
          </p>
          <p className="mt-2 text-xs text-[#5B6472]">
            Soma de tudo em categorias marcadas como investimento
          </p>
        </div>
      </div>
    </div>
  );
}