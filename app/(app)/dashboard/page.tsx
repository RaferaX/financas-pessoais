"use client";

import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface DashboardData {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  totalInvestidoMes: number;
  despesasPorCategoria: { name: string; color: string; total: number }[];
}

interface EvolucaoMes {
  label: string;
  receitas: number;
  despesas: number;
  projetado: boolean;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [evolucao, setEvolucao] = useState<EvolucaoMes[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/dashboard?month=${selectedMonth}`).then((res) => res.json()),
      fetch("/api/dashboard/evolucao").then((res) => res.json()),
    ]).then(([dashboardData, evolucaoData]) => {
      setData(dashboardData);
      setEvolucao(evolucaoData);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);

  function goToPreviousMonth() {
    const [year, month] = selectedMonth.split("-").map(Number);
    const date = new Date(year, month - 2, 1);
    setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
  }

  function goToNextMonth() {
    const [year, month] = selectedMonth.split("-").map(Number);
    const date = new Date(year, month, 1);
    setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
  }

  function formatSelectedMonth() {
    const [year, month] = selectedMonth.split("-").map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  }

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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-[#5B6472]">
              {formatSelectedMonth()}
            </p>
            <h1 className="[font-family:var(--font-display)] text-2xl font-semibold text-[#EDEFF2]">
              Dashboard
            </h1>
          </div>

          <div className="flex gap-2">
            <button
              onClick={goToPreviousMonth}
              aria-label="Mês anterior"
              className="rounded-lg border border-[#1E242E] p-2 text-[#7C8494] transition hover:border-[#2B323F] hover:text-[#EDEFF2]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={goToNextMonth}
              aria-label="Próximo mês"
              className="rounded-lg border border-[#1E242E] p-2 text-[#7C8494] transition hover:border-[#2B323F] hover:text-[#EDEFF2]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mb-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[#1E242E] bg-[#12161D] p-6">
            <p className="text-sm text-[#7C8494]">Receitas</p>
            <p className="mt-1 [font-family:var(--font-display)] text-2xl font-semibold tabular-nums text-[#34D399]">
              {formatCurrency(data.totalReceitas)}
            </p>
          </div>

          <div className="rounded-xl border border-[#1E242E] bg-[#12161D] p-6">
            <p className="text-sm text-[#7C8494]">Despesas</p>
            <p className="mt-1 [font-family:var(--font-display)] text-2xl font-semibold tabular-nums text-[#FB7185]">
              {formatCurrency(data.totalDespesas)}
            </p>
          </div>

          <div className="rounded-xl border border-[#1E242E] bg-[#12161D] p-6">
            <p className="text-sm text-[#7C8494]">Saldo</p>
            <p
              className={`mt-1 [font-family:var(--font-display)] text-2xl font-semibold tabular-nums ${
                data.saldo >= 0 ? "text-[#EDEFF2]" : "text-[#FB7185]"
              }`}
            >
              {formatCurrency(data.saldo)}
            </p>
          </div>
        </div>

        <div className="mb-8 rounded-xl border-t-2 border-t-[#E8B04B] border-x border-b border-x-[#1E242E] border-b-[#1E242E] bg-[#12161D] p-6">
          <p className="text-sm text-[#7C8494]">Investido no mês</p>
          <p className="mt-1 [font-family:var(--font-display)] text-2xl font-semibold tabular-nums text-[#E8B04B]">
            {formatCurrency(data.totalInvestidoMes)}
          </p>
        </div>

        <div className="mb-8 rounded-xl border border-[#1E242E] bg-[#12161D] p-6">
          <h2 className="mb-4 [font-family:var(--font-display)] text-base font-semibold text-[#EDEFF2]">
            Evolução mensal — Passado e Projeção
          </h2>
          <p className="mb-4 text-xs text-[#5B6472]">
            Meses futuros são projetados com base em parcelamentos já cadastrados.
          </p>
          <div className="h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={evolucao}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E242E" />
                <XAxis dataKey="label" stroke="#5B6472" fontSize={12} />
                <YAxis stroke="#5B6472" fontSize={12} />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{ backgroundColor: "#0A0D12", border: "1px solid #1E242E" }}
                  labelStyle={{ color: "#EDEFF2" }}
                />
                <Legend />
                <Bar dataKey="receitas" name="Receitas" fill="#34D399" radius={[4, 4, 0, 0]}>
                  {evolucao.map((entry, index) => (
                    <Cell key={index} fill="#34D399" fillOpacity={entry.projetado ? 0.35 : 1} />
                  ))}
                </Bar>
                <Bar dataKey="despesas" name="Despesas" fill="#FB7185" radius={[4, 4, 0, 0]}>
                  {evolucao.map((entry, index) => (
                    <Cell key={index} fill="#FB7185" fillOpacity={entry.projetado ? 0.35 : 1} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-[#1E242E] bg-[#12161D] p-6">
          <h2 className="mb-4 [font-family:var(--font-display)] text-base font-semibold text-[#EDEFF2]">
            Despesas por categoria
          </h2>

          {data.despesasPorCategoria.length === 0 ? (
            <p className="text-[#5B6472]">Nenhuma despesa lançada neste mês.</p>
          ) : (
            <div className="h-72 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.despesasPorCategoria}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(props) => `${props.name}: ${formatCurrency(Number(props.value))}`}
                  >
                    {data.despesasPorCategoria.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}