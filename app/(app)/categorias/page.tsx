"use client";

import { useState, useEffect } from "react";

interface Category {
  id: string;
  name: string;
  type: string;
  color: string;
  icon: string | null;
  isInvestment: boolean;
}

interface CategoryBudget {
  categoryId: string;
  name: string;
  color: string;
  limitValue: number | null;
  spent: number;
}

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("despesa");
  const [color, setColor] = useState("#6366f1");
  const [isInvestment, setIsInvestment] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [loadingBudgets, setLoadingBudgets] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [budgetInputs, setBudgetInputs] = useState<Record<string, string>>({});
  const [savingBudgetId, setSavingBudgetId] = useState<string | null>(null);

  async function loadCategories() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  }

  async function loadBudgets() {
    setLoadingBudgets(true);
    const res = await fetch(`/api/budgets?month=${selectedMonth}`);
    const data = await res.json();
    setBudgets(data);
    setLoadingBudgets(false);
  }

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const payload = { name, type, color, isInvestment };

    const res = await fetch(
      editingId ? `/api/categories/${editingId}` : "/api/categories",
      {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao salvar categoria.");
      return;
    }

    setName("");
    setType("despesa");
    setColor("#6366f1");
    setIsInvestment(false);
    setEditingId(null);
    loadCategories();
    loadBudgets();
  }

  function handleEdit(category: Category) {
    setEditingId(category.id);
    setName(category.name);
    setType(category.type);
    setColor(category.color);
    setIsInvestment(category.isInvestment);
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    loadCategories();
    loadBudgets();
  }

  function cancelEdit() {
    setEditingId(null);
    setName("");
    setType("despesa");
    setColor("#6366f1");
    setIsInvestment(false);
  }

  async function handleSaveBudget(categoryId: string) {
    const value = budgetInputs[categoryId];
    if (!value) return;

    setSavingBudgetId(categoryId);

    const [year, month] = selectedMonth.split("-").map(Number);

    await fetch("/api/budgets", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId,
        month,
        year,
        limitValue: parseFloat(value),
      }),
    });

    setSavingBudgetId(null);
    loadBudgets();
  }

  function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  return (
    <div className="min-h-screen bg-[#0A0D12] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-[#5B6472]">Organização</p>
        <h1 className="mb-6 [font-family:var(--font-display)] text-2xl font-semibold text-[#EDEFF2]">
          Categorias
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border border-[#1E242E] bg-[#12161D] p-6"
        >
          <h2 className="mb-4 [font-family:var(--font-display)] text-base font-semibold text-[#EDEFF2]">
            {editingId ? "Editar categoria" : "Nova categoria"}
          </h2>

          {error && (
            <div className="mb-4 rounded-lg border border-[#FB7185]/30 bg-[#FB7185]/10 px-4 py-3 text-sm text-[#FB7185]">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-[#7C8494]">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-[#1E242E] bg-[#0A0D12] px-4 py-2 text-[#EDEFF2] outline-none focus:border-[#E8B04B]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#7C8494]">Tipo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
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
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#1E242E] bg-[#0A0D12]"
              />
            </div>

            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                id="isInvestment"
                checked={isInvestment}
                onChange={(e) => setIsInvestment(e.target.checked)}
                className="h-4 w-4 rounded border-[#1E242E] bg-[#0A0D12] text-[#E8B04B]"
              />
              <label htmlFor="isInvestment" className="text-sm text-[#7C8494]">
                Esta categoria representa um investimento (ex: poupança, ações)
              </label>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-[#E8B04B] px-4 py-2 text-sm font-semibold text-[#0A0D12] transition hover:bg-[#F2BE63]"
            >
              {editingId ? "Salvar alterações" : "Criar categoria"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-lg border border-[#1E242E] px-4 py-2 text-sm text-[#7C8494] transition hover:bg-[#0A0D12] hover:text-[#EDEFF2]"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div className="space-y-2">
          {loading && <p className="text-[#5B6472]">Carregando...</p>}

          {!loading && categories.length === 0 && (
            <p className="text-[#5B6472]">Nenhuma categoria cadastrada ainda.</p>
          )}

          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-xl border border-[#1E242E] bg-[#12161D] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-[#EDEFF2]">{category.name}</span>
                <span className="text-xs text-[#5B6472]">
                  {category.type === "despesa" ? "Despesa" : "Receita"}
                </span>
                {category.isInvestment && (
                  <span className="rounded-full bg-[#E8B04B]/10 px-2 py-0.5 text-xs text-[#E8B04B]">
                    Investimento
                  </span>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(category)}
                  className="text-sm text-[#7C8494] transition hover:text-[#EDEFF2]"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-sm text-[#FB7185] transition hover:text-[#f43f5e]"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-[#1E242E] bg-[#12161D] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="[font-family:var(--font-display)] text-base font-semibold text-[#EDEFF2]">
              Orçamento por categoria
            </h2>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-lg border border-[#1E242E] bg-[#0A0D12] px-3 py-1.5 text-sm text-[#EDEFF2] outline-none focus:border-[#E8B04B]"
            />
          </div>

          {loadingBudgets && <p className="text-[#5B6472]">Carregando...</p>}

          {!loadingBudgets && budgets.length === 0 && (
            <p className="text-[#5B6472]">Nenhuma categoria de despesa cadastrada ainda.</p>
          )}

          <div className="space-y-4">
            {budgets.map((b) => {
              const hasLimit = b.limitValue !== null && b.limitValue > 0;
              const percentage = hasLimit ? Math.min((b.spent / b.limitValue!) * 100, 100) : 0;
              const isOver = hasLimit && b.spent > b.limitValue!;

              return (
                <div key={b.categoryId}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                      <span className="text-sm text-[#EDEFF2]">{b.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-sm tabular-nums ${isOver ? "text-[#FB7185]" : "text-[#7C8494]"}`}>
                        {formatCurrency(b.spent)}
                        {hasLimit && ` / ${formatCurrency(b.limitValue!)}`}
                      </span>
                    </div>
                  </div>

                  {hasLimit && (
                    <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-[#1E242E]">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: isOver ? "#FB7185" : "#34D399",
                        }}
                      />
                    </div>
                  )}

                  {isOver && (
                    <p className="mb-2 text-xs text-[#FB7185]">
                      Limite ultrapassado em {formatCurrency(b.spent - b.limitValue!)}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder={hasLimit ? String(b.limitValue) : "Definir limite"}
                      value={budgetInputs[b.categoryId] ?? ""}
                      onChange={(e) =>
                        setBudgetInputs((prev) => ({ ...prev, [b.categoryId]: e.target.value }))
                      }
                      className="w-40 rounded-lg border border-[#1E242E] bg-[#0A0D12] px-3 py-1.5 text-sm text-[#EDEFF2] outline-none focus:border-[#E8B04B]"
                    />
                    <button
                      onClick={() => handleSaveBudget(b.categoryId)}
                      disabled={savingBudgetId === b.categoryId || !budgetInputs[b.categoryId]}
                      className="rounded-lg bg-[#E8B04B] px-3 py-1.5 text-sm font-medium text-[#0A0D12] transition hover:bg-[#F2BE63] disabled:opacity-50"
                    >
                      {savingBudgetId === b.categoryId ? "Salvando..." : "Salvar"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}