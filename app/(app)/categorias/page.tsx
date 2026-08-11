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

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("despesa");
  const [color, setColor] = useState("#6366f1");
  const [isInvestment, setIsInvestment] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCategories() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  }

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  }

  function cancelEdit() {
    setEditingId(null);
    setName("");
    setType("despesa");
    setColor("#6366f1");
    setIsInvestment(false);
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
      </div>
    </div>
  );
}