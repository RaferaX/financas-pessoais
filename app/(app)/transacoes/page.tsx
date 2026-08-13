"use client";

import { useState, useEffect } from "react";

interface Category {
  id: string;
  name: string;
  type: string;
  color: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  date: string;
  category: Category;
}

export default function TransacoesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("despesa");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterMonth, setFilterMonth] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterMinAmount, setFilterMinAmount] = useState("");
  const [filterMaxAmount, setFilterMaxAmount] = useState("");

  async function loadData() {
    const params = new URLSearchParams();
    if (filterMonth) params.set("month", filterMonth);
    if (filterCategoryId) params.set("categoryId", filterCategoryId);
    if (filterType) params.set("type", filterType);
    if (filterMinAmount) params.set("minAmount", filterMinAmount);
    if (filterMaxAmount) params.set("maxAmount", filterMaxAmount);

    const [transRes, catRes] = await Promise.all([
      fetch(`/api/transactions?${params.toString()}`),
      fetch("/api/categories"),
    ]);
    const transData = await transRes.json();
    const catData = await catRes.json();
    setTransactions(transData);
    setCategories(catData);
    if (catData.length > 0 && !categoryId) {
      setCategoryId(catData[0].id);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMonth, filterCategoryId, filterType, filterMinAmount, filterMaxAmount]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!categoryId) {
      setError("Cadastre uma categoria antes de lançar uma transação.");
      return;
    }

    const payload = { amount, type, description, categoryId };

    const res = await fetch(
      editingId ? `/api/transactions/${editingId}` : "/api/transactions",
      {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao salvar transação.");
      return;
    }

    setAmount("");
    setDescription("");
    setType("despesa");
    setEditingId(null);
    loadData();
  }

  function handleEdit(transaction: Transaction) {
    setEditingId(transaction.id);
    setAmount(String(transaction.amount));
    setType(transaction.type);
    setDescription(transaction.description || "");
    setCategoryId(transaction.category.id);
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta transação?")) return;
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    loadData();
  }

  function cancelEdit() {
    setEditingId(null);
    setAmount("");
    setDescription("");
    setType("despesa");
  }

  function clearFilters() {
    setFilterMonth("");
    setFilterCategoryId("");
    setFilterType("");
    setFilterMinAmount("");
    setFilterMaxAmount("");
  }

  function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  }

  return (
    <div className="min-h-screen bg-[#0A0D12] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-[#5B6472]">Fluxo</p>
        <h1 className="mb-6 [font-family:var(--font-display)] text-2xl font-semibold text-[#EDEFF2]">
          Transações
        </h1>

        {categories.length === 0 && !loading && (
          <div className="mb-4 rounded-lg border border-[#E8B04B]/30 bg-[#E8B04B]/10 px-4 py-3 text-sm text-[#E8B04B]">
            Você ainda não tem categorias.{" "}
            <a href="/categorias" className="font-semibold underline">
              Crie uma primeiro
            </a>
            .
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border border-[#1E242E] bg-[#12161D] p-6"
        >
          <h2 className="mb-4 [font-family:var(--font-display)] text-base font-semibold text-[#EDEFF2]">
            {editingId ? "Editar transação" : "Nova transação"}
          </h2>

          {error && (
            <div className="mb-4 rounded-lg border border-[#FB7185]/30 bg-[#FB7185]/10 px-4 py-3 text-sm text-[#FB7185]">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-[#7C8494]">Valor</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full rounded-lg border border-[#1E242E] bg-[#0A0D12] px-4 py-2 tabular-nums text-[#EDEFF2] outline-none focus:border-[#E8B04B]"
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
              <label className="mb-1 block text-sm text-[#7C8494]">Categoria</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-[#1E242E] bg-[#0A0D12] px-4 py-2 text-[#EDEFF2] outline-none focus:border-[#E8B04B]"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#7C8494]">Descrição</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-[#1E242E] bg-[#0A0D12] px-4 py-2 text-[#EDEFF2] outline-none focus:border-[#E8B04B]"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-[#E8B04B] px-4 py-2 text-sm font-semibold text-[#0A0D12] transition hover:bg-[#F2BE63]"
            >
              {editingId ? "Salvar alterações" : "Lançar transação"}
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

        <div className="mb-6 rounded-xl border border-[#1E242E] bg-[#12161D] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="[font-family:var(--font-display)] text-base font-semibold text-[#EDEFF2]">
              Filtros
            </h2>
            <button
              onClick={clearFilters}
              className="text-sm text-[#7C8494] transition hover:text-[#EDEFF2]"
            >
              Limpar filtros
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-[#7C8494]">Mês</label>
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full rounded-lg border border-[#1E242E] bg-[#0A0D12] px-4 py-2 text-[#EDEFF2] outline-none focus:border-[#E8B04B]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#7C8494]">Categoria</label>
              <select
                value={filterCategoryId}
                onChange={(e) => setFilterCategoryId(e.target.value)}
                className="w-full rounded-lg border border-[#1E242E] bg-[#0A0D12] px-4 py-2 text-[#EDEFF2] outline-none focus:border-[#E8B04B]"
              >
                <option value="">Todas</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#7C8494]">Tipo</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full rounded-lg border border-[#1E242E] bg-[#0A0D12] px-4 py-2 text-[#EDEFF2] outline-none focus:border-[#E8B04B]"
              >
                <option value="">Todos</option>
                <option value="despesa">Despesa</option>
                <option value="receita">Receita</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-sm text-[#7C8494]">Valor mín.</label>
                <input
                  type="number"
                  step="0.01"
                  value={filterMinAmount}
                  onChange={(e) => setFilterMinAmount(e.target.value)}
                  className="w-full rounded-lg border border-[#1E242E] bg-[#0A0D12] px-3 py-2 tabular-nums text-[#EDEFF2] outline-none focus:border-[#E8B04B]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#7C8494]">Valor máx.</label>
                <input
                  type="number"
                  step="0.01"
                  value={filterMaxAmount}
                  onChange={(e) => setFilterMaxAmount(e.target.value)}
                  className="w-full rounded-lg border border-[#1E242E] bg-[#0A0D12] px-3 py-2 tabular-nums text-[#EDEFF2] outline-none focus:border-[#E8B04B]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {loading && <p className="text-[#5B6472]">Carregando...</p>}

          {!loading && transactions.length === 0 && (
            <p className="text-[#5B6472]">Nenhuma transação encontrada.</p>
          )}

          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between rounded-xl border border-[#1E242E] bg-[#12161D] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: transaction.category.color }}
                />
                <div>
                  <p className="text-[#EDEFF2]">
                    {transaction.description || transaction.category.name}
                  </p>
                  <p className="text-xs text-[#5B6472]">
                    {transaction.category.name} · {formatDate(transaction.date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`[font-family:var(--font-display)] font-semibold tabular-nums ${
                    transaction.type === "receita" ? "text-[#34D399]" : "text-[#FB7185]"
                  }`}
                >
                  {transaction.type === "receita" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </span>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(transaction)}
                    className="text-sm text-[#7C8494] transition hover:text-[#EDEFF2]"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="text-sm text-[#FB7185] transition hover:text-[#f43f5e]"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}