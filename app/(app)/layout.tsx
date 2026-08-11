import Sidebar from "@/app/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#0A0D12] md:flex-row">
      <Sidebar />
      <main className="relative min-w-0 flex-1 overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,_rgba(232,176,75,0.08),_transparent_70%)]" />
        <div className="relative">{children}</div>
      </main>
    </div>
  );
}