"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export default function ConfiguracoesPage() {
  const { update } = useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => {
        setName(data.name ?? "");
        setEmail(data.email ?? "");
        setLoading(false);
      });
  }, []);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileMessage(null);
    setSavingProfile(true);

    const res = await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    const data = await res.json();
    setSavingProfile(false);

    if (!res.ok) {
      setProfileMessage({ type: "error", text: data.error ?? "Erro ao atualizar perfil" });
      return;
    }

    setProfileMessage({ type: "success", text: "Perfil atualizado com sucesso!" });
    await update({ user: { name, email } });
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "As senhas não coincidem" });
      return;
    }

    setSavingPassword(true);

    const res = await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json();
    setSavingPassword(false);

    if (!res.ok) {
      setPasswordMessage({ type: "error", text: data.error ?? "Erro ao atualizar senha" });
      return;
    }

    setPasswordMessage({ type: "success", text: "Senha atualizada com sucesso!" });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    setDeleteError("");
    setDeleting(true);

    const res = await fetch("/api/user", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: deletePassword }),
    });

    const data = await res.json();

    if (!res.ok) {
      setDeleting(false);
      setDeleteError(data.error ?? "Erro ao excluir conta");
      return;
    }

    await signOut({ callbackUrl: "/login" });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0D12] px-4 py-10 sm:px-8">
        <p className="text-[#5B6472]">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0D12] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-[#5B6472]">Painel</p>
          <h1 className="[font-family:var(--font-display)] text-2xl font-semibold text-[#EDEFF2]">
            Configurações
          </h1>
        </div>

        <form
          onSubmit={handleProfileSubmit}
          className="mb-6 rounded-xl border border-[#1E242E] bg-[#12161D] p-6"
        >
          <h2 className="mb-4 [font-family:var(--font-display)] text-base font-semibold text-[#EDEFF2]">
            Informações do perfil
          </h2>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm text-[#7C8494]">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[#1E242E] bg-[#0A0D12] px-3 py-2.5 text-sm text-[#EDEFF2] outline-none transition focus:border-[#E8B04B]"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm text-[#7C8494]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#1E242E] bg-[#0A0D12] px-3 py-2.5 text-sm text-[#EDEFF2] outline-none transition focus:border-[#E8B04B]"
            />
          </div>

          {profileMessage && (
            <p
              className={`mb-4 text-sm ${
                profileMessage.type === "success" ? "text-[#34D399]" : "text-[#FB7185]"
              }`}
            >
              {profileMessage.text}
            </p>
          )}

          <button
            type="submit"
            disabled={savingProfile}
            className="rounded-lg bg-[#E8B04B] px-4 py-2.5 text-sm font-medium text-[#0A0D12] transition hover:bg-[#d9a23f] disabled:opacity-50"
          >
            {savingProfile ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>

        <form
          onSubmit={handlePasswordSubmit}
          className="rounded-xl border border-[#1E242E] bg-[#12161D] p-6"
        >
          <h2 className="mb-4 [font-family:var(--font-display)] text-base font-semibold text-[#EDEFF2]">
            Alterar senha
          </h2>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm text-[#7C8494]">Senha atual</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-[#1E242E] bg-[#0A0D12] px-3 py-2.5 text-sm text-[#EDEFF2] outline-none transition focus:border-[#E8B04B]"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm text-[#7C8494]">Nova senha</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-[#1E242E] bg-[#0A0D12] px-3 py-2.5 text-sm text-[#EDEFF2] outline-none transition focus:border-[#E8B04B]"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm text-[#7C8494]">Confirmar nova senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-[#1E242E] bg-[#0A0D12] px-3 py-2.5 text-sm text-[#EDEFF2] outline-none transition focus:border-[#E8B04B]"
            />
          </div>

          {passwordMessage && (
            <p
              className={`mb-4 text-sm ${
                passwordMessage.type === "success" ? "text-[#34D399]" : "text-[#FB7185]"
              }`}
            >
              {passwordMessage.text}
            </p>
          )}

          <button
            type="submit"
            disabled={savingPassword}
            className="rounded-lg bg-[#E8B04B] px-4 py-2.5 text-sm font-medium text-[#0A0D12] transition hover:bg-[#d9a23f] disabled:opacity-50"
          >
            {savingPassword ? "Salvando..." : "Alterar senha"}
          </button>
        </form>

        <div className="mt-6 rounded-xl border border-[#3F2530] bg-[#12161D] p-6">
          <h2 className="mb-2 [font-family:var(--font-display)] text-base font-semibold text-[#FB7185]">
            Zona de perigo
          </h2>
          <p className="mb-4 text-sm text-[#7C8494]">
            Excluir sua conta é uma ação permanente. Todos os seus dados — transações, categorias,
            metas e parcelamentos — serão apagados e não poderão ser recuperados.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="rounded-lg border border-[#FB7185] px-4 py-2.5 text-sm font-medium text-[#FB7185] transition hover:bg-[#FB7185] hover:text-[#0A0D12]"
          >
            Excluir minha conta
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-xl border border-[#1E242E] bg-[#12161D] p-6">
            <h3 className="mb-2 [font-family:var(--font-display)] text-base font-semibold text-[#EDEFF2]">
              Confirmar exclusão
            </h3>
            <p className="mb-4 text-sm text-[#7C8494]">
              Digite sua senha para confirmar. Essa ação não pode ser desfeita.
            </p>

            <form onSubmit={handleDeleteAccount}>
              <input
                type="password"
                placeholder="Sua senha"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                autoFocus
                className="mb-3 w-full rounded-lg border border-[#1E242E] bg-[#0A0D12] px-3 py-2.5 text-sm text-[#EDEFF2] outline-none transition focus:border-[#FB7185]"
              />

              {deleteError && (
                <p className="mb-3 text-sm text-[#FB7185]">{deleteError}</p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword("");
                    setDeleteError("");
                  }}
                  className="flex-1 rounded-lg border border-[#1E242E] px-4 py-2.5 text-sm font-medium text-[#EDEFF2] transition hover:border-[#2B323F]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={deleting}
                  className="flex-1 rounded-lg bg-[#FB7185] px-4 py-2.5 text-sm font-medium text-[#0A0D12] transition hover:bg-[#f4586c] disabled:opacity-50"
                >
                  {deleting ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}