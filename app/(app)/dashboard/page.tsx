"use client";

import { useSession } from "next-auth/react";
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

interface CategoryBudget {
  categoryId: string;
  name: string;
  color: string;
  limitValue: number | null;
  spent: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0];

  const [data, setData] = useState<DashboardData | null>(null);
  const [evolucao, setEvolucao] = useState<EvolucaoMes[]>([]);
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [hasCategories, setHasCategories] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState("despesa");
  const [newCategoryColor, setNewCategoryColor] = useState("#6366f1");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [onboardingError, setOnboardingError] = useState("");

  async function loadAll() {
    setLoading(true);
    const [dashboardData, evolucaoData, budgetsData, categoriesData] = await Promise.all([
      fetch(`/api/dashboard?month=${selectedMonth}`).then((res) => res.json()),
      fetch("/api/dashboard/evolucao").then((res) => res.json()),
      fetch(`/api/budgets?month=${selectedMonth}`).then((res) => res.json()),
      fetch("/api/categories").then((res) => res.json()),
    ]);

    setData(dashboardData);
    setEvolucao(evolucaoData);
    setBudgets(budgetsData);

    const hasAny = Array.isArray(categoriesData) && categoriesData.length > 0;
    setHasCategories(hasAny);
    if (!hasAny && !onboardingDismissed) {
      setShowOnboarding(true);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);

  async function handleCreateFirstCategory(e: React.FormEvent) {
    e.preventDefault();
    setOnboardingError("");

    if (!newCategoryName.trim()) {
      setOnboardingError("Dê um nome para a categoria.");
      return;
    }

    setCreatingCategory(true);

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newCategoryName,
        type: newCategoryType,
        color: newCategoryColor,
        isInvestment: false,
      }),
    });

    setCreatingCategory(false);

    if (!res.ok) {
      const data = await res.json();
      setOnboardingError(data.error || "Erro ao criar categoria.");
      return;
    }

    setShowOnboarding(false);
    setNewCategoryName("");
    setNewCategoryType("despesa");
    setNewCategoryColor("#6366f1");
    loadAll();
  }

  function handleSkipOnboarding() {
    setShowOnboarding(false);
    setOnboardingDismissed(true);
  }

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

  const budgetsWithLimit = budgets.filter((b) => b.limitValue !== null && b.limitValue > 0);

  return (
    <div className="min-h-screen bg-[#0A0D12] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-[#5B6472]">
              {formatSelectedMonth()}
            </p>
            <h1 className="[font-family:var(--font-display)] text-2xl font-semibold text-[#EDEFF2]">
              {firstName ? `Bem-vindo, ${firstName}!` : "Dashboard"}
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

        {!hasCategories && !showOnboarding && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-[#E8B04B]/30 bg-[#E8B04B]/10 px-4 py-3">
            <p className="text-sm text-[#E8B04B]">
              Você ainda não tem categorias. Elas são a base para organizar suas transações.
            </p>
            <button
              onClick={() => setShowOnboarding(true)}
              className="text-sm font-medium text-[#E8B04B] underline hover:no-underline"
            >
              Criar agora
            </button>
          </div>
        )}

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

        {budgetsWithLimit.length > 0 && (
          <div className="mb-8 rounded-xl border border-[#1E242E] bg-[#12161D] p-6">
            <h2 className="mb-4 [font-family:var(--font-display)] text-base font-semibold text-[#EDEFF2]">
              Orçamento por categoria
            </h2>

            <div className="space-y-4">
              {budgetsWithLimit.map((b) => {
                const percentage = Math.min((b.spent / b.limitValue!) * 100, 100);
                const isOver = b.spent > b.limitValue!;

                return (
                  <div key={b.categoryId}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                        <span className="text-sm text-[#EDEFF2]">{b.name}</span>
                      </div>

                      <span className={`text-sm tabular-nums ${isOver ? "text-[#FB7185]" : "text-[#7C8494]"}`}>
                        {formatCurrency(b.spent)} / {formatCurrency(b.limitValue!)}
                      </span>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#1E242E]">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: isOver ? "#FB7185" : "#34D399",
                        }}
                      />
                    </div>

                    {isOver && (
                      <p className="mt-1.5 text-xs text-[#FB7185]">
                        Limite ultrapassado em {formatCurrency(b.spent - b.limitValue!)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

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

      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-xl border border-[#1E242E] bg-[#12161D] p-8">
            <p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-[#E8B04B]">
              Bem-vindo{firstName ? `, ${firstName}` : ""}!
            </p>
            <h2 className="mb-2 [font-family:var(--font-display)] text-xl font-semibold text-[#EDEFF2]">
              Vamos criar sua primeira categoria
            </h2>
            <p className="mb-6 text-sm text-[#7C8494]">
              Categorias são a base do app — é com elas que você organiza suas receitas e
              despesas. Você pode criar quantas quiser depois, em Categorias.
            </p>

            {onboardingError && (
              <div className="mb-4 rounded-lg border border-[#FB7185]/30 bg-[#FB7185]/10 px-4 py-3 text-sm text-[#FB7185]">
                {onboardingError}
              </div>
            )}

            <form onSubmit={handleCreateFirstCategory} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-[#7C8494]">Nome</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ex: Alimentação, Salário, Transporte"
                  autoFocus
                  className="w-full rounded-lg border border-[#1E242E] bg-[#0A0D12] px-4 py-2 text-[#EDEFF2] outline-none focus:border-[#E8B04B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-[#7C8494]">Tipo</label>
                  <select
                    value={newCategoryType}
                    onChange={(e) => setNewCategoryType(e.target.value)}
                    className="w-full rounded-lg border border-[#1E242E] bg-[#0A0D12] px-4 py-2 text-[#EDEFF2] outline-none focus:border-[#E8B04B]"
                  >
                    <option value="despesa">Despesa</option>
                    <option value="receita">Receita</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-[#7C8494]">Cor</label>
                  <input
                    type="color"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="h-10 w-full rounded-lg border border-[#1E242E] bg-[#0A0D12]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSkipOnboarding}
                  className="flex-1 rounded-lg border border-[#1E242E] px-4 py-2.5 text-sm font-medium text-[#7C8494] transition hover:border-[#2B323F] hover:text-[#EDEFF2]"
                >
                  Pular por agora
                </button>
                <button
                  type="submit"
                  disabled={creatingCategory}
                  className="flex-1 rounded-lg bg-[#E8B04B] px-4 py-2.5 text-sm font-semibold text-[#0A0D12] transition hover:bg-[#F2BE63] disabled:opacity-50"
                >
                  {creatingCategory ? "Criando..." : "Criar categoria"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}