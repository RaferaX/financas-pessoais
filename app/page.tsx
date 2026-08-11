import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0D12] px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,_rgba(232,176,75,0.1),_transparent_70%)]" />

      <div className="relative z-10 mx-auto max-w-xl text-center">
        <p className="mb-4 text-[11px] uppercase tracking-[0.25em] text-[#5B6472]">
          Controle financeiro pessoal
        </p>

        <h1 className="mb-4 [font-family:var(--font-display)] text-4xl font-semibold text-[#EDEFF2] sm:text-5xl">
          Suas Finanças<span className="text-[#E8B04B]">.</span>
        </h1>

        <p className="mb-10 text-base text-[#8A93A3] sm:text-lg">
          Organize receitas, despesas e investimentos em um só lugar.
          Saiba exatamente quanto você tem, quanto gasta e quanto está construindo.
        </p>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/cadastro"
            className="w-full rounded-lg bg-[#E8B04B] px-6 py-3 text-center text-sm font-semibold text-[#0A0D12] transition hover:bg-[#F2BE63] sm:w-auto"
          >
            Criar conta
          </Link>
          <Link
            href="/login"
            className="w-full rounded-lg border border-[#1E242E] px-6 py-3 text-center text-sm font-semibold text-[#EDEFF2] transition hover:border-[#2B323F] hover:bg-[#12161D] sm:w-auto"
          >
            Entrar
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-4 border-t border-[#1E242E] pt-8 text-left">
          <div>
            <p className="[font-family:var(--font-display)] text-lg font-semibold text-[#34D399]">Receitas</p>
            <p className="mt-1 text-xs text-[#5B6472]">Acompanhe tudo que entra</p>
          </div>
          <div>
            <p className="[font-family:var(--font-display)] text-lg font-semibold text-[#FB7185]">Despesas</p>
            <p className="mt-1 text-xs text-[#5B6472]">Por categoria, todo mês</p>
          </div>
          <div>
            <p className="[font-family:var(--font-display)] text-lg font-semibold text-[#E8B04B]">Patrimônio</p>
            <p className="mt-1 text-xs text-[#5B6472]">Dia a dia + investimentos</p>
          </div>
        </div>
      </div>
    </div>
  );
}