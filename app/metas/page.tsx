"use client";

import { useState, useEffect } from "react";

interface Category {
  id: string;
  name: string;
  color: string;
  isInvestment: boolean;
}

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  deadline: string | null;
  currentAmount: number;
  progress: number;
  category: Category;
}

export default function MetasPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const investmentCategories = categories.filter((c) => c.isInvestment);

  async function loadData() {
    const [goalsRes, catRes] = await Promise.all([
      fetch("/api/goals"),
      fetch("/api/categories"),
    ]);
    const goalsData = await goalsRes.json();
    const catData = await catRes.json();
    setGoals(goalsData);
    setCategories(catData);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const invCats = categories.filter((c) => c.isInvestment);
    if (invCats.length > 0 && !categoryId) {
      setCategoryId(invCats[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (editingId) {
      const res = await fetch(`/api/goals/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, targetAmount, deadline: deadline || null }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao editar meta.");
        return;
      }

      setName("");
      setTargetAmount("");
      setDeadline("");
      setEditingId(null);
      loadData();
      return;
    }

    if (!categoryId) {
      setError("Cadastre uma categoria de investimento antes de criar uma meta.");
      return;
    }

    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, targetAmount, deadline: deadline || null, categoryId }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao criar meta.");
      return;
    }

    setName("");
    setTargetAmount("");
    setDeadline("");
    loadData();
  }

  function handleEdit(goal: Goal) {
    setEditingId(goal.id);
    setName(goal.name);
    setTargetAmount(String(goal.targetAmount));
    setDeadline(goal.deadline ? goal.deadline.split("T")[0] : "");
  }

  function cancelEdit() {
    setEditingId(null);
    setName("");
    setTargetAmount("");
    setDeadline("");
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta meta?")) return;
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
    loadData();
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
        <p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-[#5B6472]">Objetivos</p>
        <h1 className="mb-6 [font-family:var(--font-display)] text-2xl font-semibold text-[#EDEFF2]">
          Metas de economia
        </h1>

        {investmentCategories.length === 0 && !loading && (
          <div className="mb-4 rounded-lg border border-[#E8B04B]/30 bg-[#E8B04B]/10 px-4 py-3 text-sm text-[#E8B04B]">
            Você precisa de uma categoria marcada como investimento antes de criar uma meta.{" "}
            <a href="/categorias" className="font-semibold underline">
              Criar categoria
            </a>
            .
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border border-[#1E242E] bg-[#12161D] p-6"
        >
          <h2 className="mb-4 [font-family:var(--font-display)] text-base font-semibold text-[#EDEFF2]">
            {editingId ? "Editar meta" : "Nova meta"}
          </h2>

          {error && (
            <div className="mb-4 rounded-lg border border-[#FB7185]/30 bg-[#FB7185]/10 px-4 py-3 text-sm text-[#FB7185]">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm text-[#7C8494]">Nome da meta</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Viagem, Reserva de emergência"
                required
                className="w-full rounded-lg border border-[#1E242E] bg-[#0A0D12] px-4 py-2 text-[#EDEFF2] outline-none focus:border-[#E8B04B]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#7C8494]">Valor-alvo</label>
              <input
                type="number"
                step="0.01"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
                className="w-full rounded-lg border border-[#1E242E] bg-[#0A0D12] px-4 py-2 tabular-nums text-[#EDEFF2] outline-none focus:border-[#E8B04B]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#7C8494]">Prazo (opcional)</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-lg border border-[#1E242E] bg-[#0A0D12] px-4 py-2 text-[#EDEFF2] outline-none focus:border-[#E8B04B]"
              />
            </div>

            {!editingId && (
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-[#7C8494]">
                  Categoria de investimento
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-lg border border-[#1E242E] bg-[#0A0D12] px-4 py-2 text-[#EDEFF2] outline-none focus:border-[#E8B04B]"
                >
                  {investmentCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-[#E8B04B] px-4 py-2 text-sm font-semibold text-[#0A0D12] transition hover:bg-[#F2BE63]"
            >
              {editingId ? "Salvar alterações" : "Criar meta"}
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

        <div className="space-y-3">
          {loading && <p className="text-[#5B6472]">Carregando...</p>}

          {!loading && goals.length === 0 && (
            <p className="text-[#5B6472]">Nenhuma meta cadastrada ainda.</p>
          )}

          {goals.map((goal) => (
            <div
              key={goal.id}
              className="rounded-xl border border-[#1E242E] bg-[#12161D] p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[#EDEFF2]">{goal.name}</p>
                  <p className="text-xs text-[#5B6472]">
                    {goal.category.name}
                    {goal.deadline && ` · até ${formatDate(goal.deadline)}`}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(goal)}
                    className="text-sm text-[#7C8494] transition hover:text-[#EDEFF2]"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-sm text-[#FB7185] transition hover:text-[#f43f5e]"
                  >
                    Excluir
                  </button>
                </div>
              </div>

              <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-[#0A0D12]">
                <div
                  className="h-full rounded-full bg-[#E8B04B] transition-all"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="[font-family:var(--font-display)] tabular-nums text-[#E8B04B]">
                  {formatCurrency(goal.currentAmount)}
                </span>
                <span className="text-[#5B6472]">
                  {goal.progress.toFixed(0)}% de {formatCurrency(goal.targetAmount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}