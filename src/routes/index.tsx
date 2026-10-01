import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Entrar — Personal AI OS" },
      {
        name: "description",
        content:
          "Acesse o Personal AI OS, seu assistente pessoal modular para carreira, e-mails, estudos e agenda.",
      },
      { property: "og:title", content: "Entrar — Personal AI OS" },
      {
        property: "og:description",
        content: "Seu assistente pessoal de IA modular, com aprovação humana em cada ação.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute -top-40 -left-32 size-[520px] rounded-full bg-brand/25 blur-3xl blob" />
      <div className="pointer-events-none absolute top-1/3 -right-40 size-[560px] rounded-full bg-accent/30 blur-3xl blob2" />

      <div className="glass relative z-10 w-full max-w-md rounded-3xl p-7">
        <div className="flex items-center gap-2.5">
          <div className="gradient-brand shadow-brand grid size-9 place-items-center rounded-xl font-display text-sm font-bold text-primary-foreground">
            A
          </div>
          <div>
            <p className="font-display text-[15px] leading-none font-semibold">Personal AI OS</p>
            <p className="mt-1 text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              Assistente modular
            </p>
          </div>
        </div>

        <h1 className="mt-7 font-display text-2xl font-bold tracking-tight">Bem-vindo de volta</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Entre para acessar seus agentes e aprovações.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <label className="block">
            <span className="text-[12px] font-medium text-muted-foreground">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="igor@exemplo.com"
              className="glass-soft mt-1.5 w-full rounded-xl px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="block">
            <span className="text-[12px] font-medium text-muted-foreground">Senha</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="glass-soft mt-1.5 w-full rounded-xl px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>

          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>

        <Button
          variant="outline"
          className="mt-3 w-full"
          onClick={() => navigate({ to: "/dashboard" })}
        >
          Continuar com Google
        </Button>

        <p className="mt-5 text-center text-[12px] text-muted-foreground">
          Não tem conta?{" "}
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="font-semibold text-brand"
          >
            Criar conta
          </button>
        </p>
      </div>
    </div>
  );
}
