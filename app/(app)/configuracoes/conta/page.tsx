"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function ContaPage() {
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

    if (data.emailChangeRequested) {
      setProfileMessage({
        type: "success",
        text: `Nome atualizado. Enviamos um link de confirmação para ${email}. Seu email atual continua ativo até você confirmar.`,
      });
      setEmail(data.email);
      await update({ user: { name } });
    } else {
      setProfileMessage({ type: "success", text: "Perfil atualizado com sucesso!" });
      await update({ user: { name, email: data.email } });
    }
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
      <div className="min-h-screen bg-[var(--bg)] px-4 py-10 sm:px-8">
        <p className="text-[var(--text-faint)]">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <a
            href="/configuracoes"
            className="mb-1 inline-block text-[11px] uppercase tracking-[0.2em] text-[var(--text-faint)] hover:text-[var(--text-hi)]"
          >
            Voltar
          </a>
          <h1 className="[font-family:var(--font-display)] text-2xl font-semibold text-[var(--text-hi)]">
            Conta
          </h1>
        </div>

        <form
          onSubmit={handleProfileSubmit}
          className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6"
        >
          <h2 className="mb-4 [font-family:var(--font-display)] text-base font-semibold text-[var(--text-hi)]">
            Informações do perfil
          </h2>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm text-[var(--text-lo)]">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text-hi)] outline-none transition focus:border-[var(--gold)]"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm text-[var(--text-lo)]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text-hi)] outline-none transition focus:border-[var(--gold)]"
            />
          </div>

          {profileMessage && (
            <p
              className={`mb-4 text-sm ${
                profileMessage.type === "success" ? "text-[var(--mint)]" : "text-[var(--rose)]"
              }`}
            >
              {profileMessage.text}
            </p>
          )}

          <button
            type="submit"
            disabled={savingProfile}
            className="rounded-lg bg-[var(--gold)] px-4 py-2.5 text-sm font-medium text-[var(--bg)] transition hover:bg-[var(--gold-hover)] disabled:opacity-50"
          >
            {savingProfile ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>

        <form
          onSubmit={handlePasswordSubmit}
          className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6"
        >
          <h2 className="mb-4 [font-family:var(--font-display)] text-base font-semibold text-[var(--text-hi)]">
            Alterar senha
          </h2>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm text-[var(--text-lo)]">Senha atual</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text-hi)] outline-none transition focus:border-[var(--gold)]"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm text-[var(--text-lo)]">Nova senha</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text-hi)] outline-none transition focus:border-[var(--gold)]"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm text-[var(--text-lo)]">Confirmar nova senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text-hi)] outline-none transition focus:border-[var(--gold)]"
            />
          </div>

          {passwordMessage && (
            <p
              className={`mb-4 text-sm ${
                passwordMessage.type === "success" ? "text-[var(--mint)]" : "text-[var(--rose)]"
              }`}
            >
              {passwordMessage.text}
            </p>
          )}

          <button
            type="submit"
            disabled={savingPassword}
            className="rounded-lg bg-[var(--gold)] px-4 py-2.5 text-sm font-medium text-[var(--bg)] transition hover:bg-[var(--gold-hover)] disabled:opacity-50"
          >
            {savingPassword ? "Salvando..." : "Alterar senha"}
          </button>
        </form>

        <div className="mt-6 rounded-xl border border-[var(--rose)]/30 bg-[var(--panel)] p-6">
          <h2 className="mb-2 [font-family:var(--font-display)] text-base font-semibold text-[var(--rose)]">
            Zona de perigo
          </h2>
          <p className="mb-4 text-sm text-[var(--text-lo)]">
            Excluir sua conta é uma ação permanente. Todos os seus dados — transações, categorias,
            metas e parcelamentos — serão apagados e não poderão ser recuperados.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="rounded-lg border border-[var(--rose)] px-4 py-2.5 text-sm font-medium text-[var(--rose)] transition hover:bg-[var(--rose)] hover:text-[var(--bg)]"
          >
            Excluir minha conta
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6">
            <h3 className="mb-2 [font-family:var(--font-display)] text-base font-semibold text-[var(--text-hi)]">
              Confirmar exclusão
            </h3>
            <p className="mb-4 text-sm text-[var(--text-lo)]">
              Digite sua senha para confirmar. Essa ação não pode ser desfeita.
            </p>

            <form onSubmit={handleDeleteAccount}>
              <input
                type="password"
                placeholder="Sua senha"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                autoFocus
                className="mb-3 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text-hi)] outline-none transition focus:border-[var(--rose)]"
              />

              {deleteError && <p className="mb-3 text-sm text-[var(--rose)]">{deleteError}</p>}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword("");
                    setDeleteError("");
                  }}
                  className="flex-1 rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--text-hi)] transition hover:border-[var(--border-hover)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={deleting}
                  className="flex-1 rounded-lg bg-[var(--rose)] px-4 py-2.5 text-sm font-medium text-[var(--bg)] transition hover:opacity-90 disabled:opacity-50"
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