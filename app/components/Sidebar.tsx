"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transacoes", label: "Transações" },
  { href: "/parcelamentos", label: "Parcelamentos" },
  { href: "/metas", label: "Metas" },
  { href: "/categorias", label: "Categorias" },
  { href: "/patrimonio", label: "Patrimônio" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const NavLinks = () => (
  <nav className="flex-1 space-y-1">
    {links.map((link) => {
      const isActive = pathname === link.href;
      return (
        <Link
          key={link.href}
          href={link.href}
          onClick={() => setOpen(false)}
          className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
            isActive
              ? "bg-[#1A1F28] text-[#EDEFF2] shadow-[inset_2px_0_0_0_#E8B04B]"
              : "text-[#7C8494] hover:bg-[#12161D] hover:text-[#EDEFF2]"
          }`}
        >
          <span
            className={`mr-2.5 h-1.5 w-1.5 rounded-full transition-colors ${
              isActive ? "bg-[#E8B04B]" : "bg-[#2B323F] group-hover:bg-[#5B6472]"
            }`}
          />
          {link.label}
        </Link>
      );
    })}
  </nav>
);

  return (
    <>
      
      <div className="flex items-center justify-between border-b border-[#1E242E] bg-[#0A0D12] px-4 py-4 md:hidden">
        <h2 className="[font-family:var(--font-display)] text-lg font-semibold text-[#EDEFF2]">
          Finanças<span className="text-[#E8B04B]">.</span>
        </h2>
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="rounded-md border border-[#1E242E] p-2 text-[#EDEFF2]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-[#1E242E] bg-[#0A0D12] px-5 py-6">
            <div className="mb-8 flex items-center justify-between px-1">
              <h2 className="[font-family:var(--font-display)] text-lg font-semibold text-[#EDEFF2]">
                Finanças<span className="text-[#E8B04B]">.</span>
              </h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="text-[#7C8494]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <NavLinks />

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="mt-6 rounded-md border border-[#1E242E] px-3 py-2 text-left text-sm text-[#7C8494] transition-colors hover:border-[#2B323F] hover:text-[#EDEFF2]"
            >
              Sair
            </button>
          </aside>
        </div>
      )}

      
      <aside className="hidden w-60 shrink-0 flex-col border-r border-[#1E242E] bg-[#0A0D12] px-5 py-8 md:flex">
        <div className="mb-10 px-1">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#5B6472]">Painel</p>
          <h2 className="mt-1 [font-family:var(--font-display)] text-xl font-semibold text-[#EDEFF2]">
            Finanças<span className="text-[#E8B04B]">.</span>
          </h2>
        </div>

        <NavLinks />

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mt-6 rounded-md border border-[#1E242E] px-3 py-2 text-left text-sm text-[#7C8494] transition-colors hover:border-[#2B323F] hover:text-[#EDEFF2]"
        >
          Sair
        </button>
      </aside>
    </>
  );
}