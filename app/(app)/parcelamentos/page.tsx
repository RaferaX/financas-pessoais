"use client";

import { useState, useEffect } from "react";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  type: string;
  totalInstallments: number;
  startDate: string;
  category: Category;
}

export default function ParcelamentosPage() {
  const [recurrings, setRecurrings] = useState<RecurringTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("despesa");
  const [totalInstallments, setTotalInstallments] = useState("2");
  const [startDate, setStartDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    const [recRes, catRes] = await Promise.all([
      fetch("/api/recurring-transactions"),
      fetch("/api/categories"),
    ]);
    const recData = await recRes.json();
    const catData = await catRes.json();
    setRecurrings(recData);
    setCategories(catData);
    if (catData.length > 0 && !categoryId) {
      setCategoryId(catData[0].id);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!categoryId) {
      setError("Cadastre uma categoria antes de criar um parcelamento.");
      return;
    }

    if (editingId) {
      const res = await fetch(`/api/recurring-transactions/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, categoryId }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao editar parcelamento.");
        return;
      }

      setDescription("");
      setEditingId(null);
      loadData();
      return;
    }

    const installmentAmount = (
      parseFloat(amount) / parseInt(totalInstallments)
    ).toFixed(2);

    const res = await fetch("/api/recurring-transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description,
        amount: installmentAmount,
        type,
        totalInstallments,
        startDate: startDate || new Date().toISOString(),
        categoryId,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao criar parcelamento.");
      return;
    }

    setDescription("");
    setAmount("");
    setTotalInstallments("2");
    setStartDate("");
    loadData();
  }

  function handleEdit(rec: RecurringTransaction) {
    setEditingId(rec.id);
    setDescription(rec.description);
    setCategoryId(rec.category.id);
  }

  function cancelEdit() {
    setEditingId(null);
    setDescription("");
  }

  async function handleDelete(id: string) {
    if (
      !confirm(
        "Excluir este parcelamento vai remover TODAS as parcelas (passadas e futuras). Continuar?"
      )
    )
      return;
    await fetch(`/api/recurring-transactions/${id}`, { method: "DELETE" });
    loadData();
  }

  function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="min-h-screen bg-[#0A0D12] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-[#5B6472]">
          Compromissos futuros
        </p>
        <h1 className="mb-6 [font-family:var(--font-display)] text-2xl font-semibold text-[#EDEFF2]">
          Parcelamentos
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
            {editingId ? "Editar parcelamento" : "Novo parcelamento"}
          </h2>

          {error && (
            <div className="mb-4 rounded-lg border border-[#FB7185]/30 bg-[#FB7185]/10 px-4 py-3 text-sm text-[#FB7185]">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm text-[#7C8494]">Descrição</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Notebook, Curso, Financiamento do carro"
                required
                className="w-full rounded-lg border border-[#1E242E] bg-[#0A0D12] px-4 py-2 text-[#EDEFF2] outline-none focus:border-[#E8B04B]"
              />
            </div>

            {!editingId && (
              <>
                <div>
                  <label className="mb-1 block text-sm text-[#7C8494]">
                    Valor total da compra
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full rounded-lg border border-[#1E242E] bg-[#0A0D12] px-4 py-2 tabular-nums text-[#EDEFF2] outline-none focus:border-[#E8B04B]"
                  />
                  {amount && totalInstallments && (
                    <p className="mt-1 text-xs text-[#5B6472]">
                      {totalInstallments}x de{" "}
                      {(
                        parseFloat(amount) / parseInt(totalInstallments)
                      ).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm text-[#7C8494]">
                    Nº de parcelas
                  </label>
                  <input
                    type="number"
                    min="2"
                    value={totalInstallments}
                    onChange={(e) => setTotalInstallments(e.target.value)}
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
              </>
            )}

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

            {!editingId && (
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-[#7C8494]">
                  Primeira parcela em
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-[#1E242E] bg-[#0A0D12] px-4 py-2 text-[#EDEFF2] outline-none focus:border-[#E8B04B]"
                />
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-[#E8B04B] px-4 py-2 text-sm font-semibold text-[#0A0D12] transition hover:bg-[#F2BE63]"
            >
              {editingId ? "Salvar alterações" : "Criar parcelamento"}
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

          {!loading && recurrings.length === 0 && (
            <p className="text-[#5B6472]">Nenhum parcelamento cadastrado ainda.</p>
          )}

          {recurrings.map((rec) => (
            <div
              key={rec.id}
              className="flex items-center justify-between rounded-xl border border-[#1E242E] bg-[#12161D] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: rec.category.color }}
                />
                <div>
                  <p className="text-[#EDEFF2]">{rec.description}</p>
                  <p className="text-xs text-[#5B6472]">
                    {rec.totalInstallments}x de {formatCurrency(rec.amount)} · desde{" "}
                    {formatDate(rec.startDate)}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(rec)}
                  className="text-sm text-[#7C8494] transition hover:text-[#EDEFF2]"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(rec.id)}
                  className="text-sm text-[#FB7185] transition hover:text-[#f43f5e]"
                >
                  Excluir tudo
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}