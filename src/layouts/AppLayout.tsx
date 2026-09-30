import { useState, type ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

interface AppLayoutProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  headerAction?: ReactNode;
  children: ReactNode;
}

export function AppLayout({ eyebrow, title, subtitle, headerAction, children }: AppLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -left-32 size-[520px] rounded-full bg-brand/25 blur-3xl blob" />
      <div className="pointer-events-none absolute top-1/3 -right-40 size-[560px] rounded-full bg-accent/30 blur-3xl blob2" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 size-[420px] rounded-full bg-rose/10 blur-3xl blob" />

      <div className="relative z-10 flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 p-4 lg:block">
          <Sidebar />
        </aside>

        {menuOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              aria-label="Fechar menu"
              onClick={() => setMenuOpen(false)}
              className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            />
            <div className="relative h-full w-72 p-4">
              <Sidebar onNavigate={() => setMenuOpen(false)} />
            </div>
          </div>
        ) : null}

        <main className="min-w-0 flex-1 space-y-6 p-4 sm:p-6">
          <Header
            eyebrow={eyebrow}
            title={title}
            subtitle={subtitle}
            action={headerAction}
            onOpenMenu={() => setMenuOpen(true)}
          />
          {children}
        </main>
      </div>
    </div>
  );
}
