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
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [evolucao, setEvolucao] = useState<EvolucaoMes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard").then((res) => res.json()),
      fetch("/api/dashboard/evolucao").then((res) => res.json()),
    ]).then(([dashboardData, evolucaoData]) => {
      setData(dashboardData);
      setEvolucao(evolucaoData);
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
        <p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-[#5B6472]">
          {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </p>
        <h1 className="mb-6 [font-family:var(--font-display)] text-2xl font-semibold text-[#EDEFF2]">
          Dashboard
        </h1>

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
          <p className="text-sm text-[#7C8494]">Investido este mês</p>
          <p className="mt-1 [font-family:var(--font-display)] text-2xl font-semibold tabular-nums text-[#E8B04B]">
            {formatCurrency(data.totalInvestidoMes)}
          </p>
        </div>

        <div className="mb-8 rounded-xl border border-[#1E242E] bg-[#12161D] p-6">
          <h2 className="mb-4 [font-family:var(--font-display)] text-base font-semibold text-[#EDEFF2]">
            Evolução mensal — Receitas x Despesas
          </h2>
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
                <Bar dataKey="receitas" name="Receitas" fill="#34D399" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesas" name="Despesas" fill="#FB7185" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-[#1E242E] bg-[#12161D] p-6">
          <h2 className="mb-4 [font-family:var(--font-display)] text-base font-semibold text-[#EDEFF2]">
            Despesas por categoria
          </h2>

          {data.despesasPorCategoria.length === 0 ? (
            <p className="text-[#5B6472]">Nenhuma despesa lançada este mês ainda.</p>
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