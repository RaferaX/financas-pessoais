import Link from "next/link";

const options = [
  {
    href: "/configuracoes/conta",
    title: "Conta",
    description: "Nome, e-mail, senha e exclusão de conta",
  },
  {
    href: "/configuracoes/aparencia",
    title: "Aparência em atualização",
    description: "Escolha entre tema claro ou escuro",
  },
];

export default function ConfiguracoesPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-[var(--text-faint)]">Painel</p>
        <h1 className="mb-6 [font-family:var(--font-display)] text-2xl font-semibold text-[var(--text-hi)]">
          Configurações
        </h1>

        <div className="space-y-2">
          {options.map((opt) => (
            <Link
              key={opt.href}
              href={opt.href}
              className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 transition hover:border-[var(--border-hover)]"
            >
              <div>
                <p className="[font-family:var(--font-display)] font-semibold text-[var(--text-hi)]">
                  {opt.title}
                </p>
                <p className="mt-1 text-sm text-[var(--text-lo)]">{opt.description}</p>
              </div>
              <span className="text-[var(--text-faint)]">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}