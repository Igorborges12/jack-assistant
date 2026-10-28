
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/common/Button";
import { request, ApiError } from "@/services/http";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Entrar — Jack" },
      {
        name: "description",
        content:
          "Acesse o Jack, seu assistente pessoal modular para carreira, e-mails, estudos e agenda.",
      },
      { property: "og:title", content: "Entrar — Jack" },
      {
        property: "og:description",
        content:
          "Seu assistente pessoal de IA modular, com aprovação humana em cada ação.",
      },
    ],
  }),
  component: LoginPage,
});

type LoginResponse = {
  access_token: string;
  token_type: string;
};

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setInfo("");
    setLoading(true);

    try {
      const response = await request<LoginResponse>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      if (!response.access_token) {
        throw new Error("Token não recebido do servidor.");
      }

      // Armazena o token para as próximas requisições.
      window.localStorage.setItem(
        "paios.token",
        response.access_token
      );

      // Redireciona após o login bem-sucedido.
      await navigate({ to: "/dashboard" });

    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError("E-mail ou senha incorretos.");
        } else if (err.status === 403) {
          setError("Esta conta está desativada.");
        } else if (err.status === 422) {
          setError("Verifique o formato do e-mail informado.");
        } else {
          setError(
            "Não foi possível realizar o login. Tente novamente."
          );
        }
      } else {
        setError(
          "Erro de conexão. Verifique se o backend está funcionando."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute -top-40 -left-32 size-[520px] rounded-full bg-brand/25 blur-3xl blob" />
      <div className="pointer-events-none absolute top-1/3 -right-40 size-[560px] rounded-full bg-accent/30 blur-3xl blob2" />

      <div className="glass relative z-10 w-full max-w-md rounded-3xl p-7">
        <div className="flex items-center gap-2.5">
          <div className="gradient-brand shadow-brand grid size-9 place-items-center rounded-xl font-display text-sm font-bold text-primary-foreground">
            J
          </div>

          <div>
            <p className="font-display text-[15px] leading-none font-semibold">
              Jack
            </p>
            <p className="mt-1 text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              Personal AI OS
            </p>
          </div>
        </div>

        <h1 className="mt-7 font-display text-2xl font-bold tracking-tight">
          Bem-vindo de volta
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Entre para conversar com o Jack e revisar suas aprovações.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <label className="block">
            <span className="text-[12px] font-medium text-muted-foreground">
              Email
            </span>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="igor@exemplo.com"
              autoComplete="email"
              required
              disabled={loading}
              className="glass-soft mt-1.5 w-full rounded-xl px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>

          <label className="block">
            <span className="text-[12px] font-medium text-muted-foreground">
              Senha
            </span>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              disabled={loading}
              className="glass-soft mt-1.5 w-full rounded-xl px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500"
            >
              {error}
            </p>
          )}

          {info && (
            <p
              role="status"
              className="rounded-xl border border-brand/30 bg-brand/10 px-3 py-2 text-sm text-muted-foreground"
            >
              {info}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <Button
          variant="outline"
          className="mt-3 w-full"
          disabled={loading}
          onClick={() => {
            setError("");
            setInfo(
              "Login com Google ainda não está disponível."
            );
          }}
        >
          Continuar com Google
        </Button>

        <p className="mt-5 text-center text-[12px] text-muted-foreground">
          Não tem conta?{" "}
          <button
            type="button"
            onClick={() => {
              setError("");
              setInfo(
                "O cadastro pela interface estará disponível em breve."
              );
            }}
            className="font-semibold text-brand"
          >
            Criar conta
          </button>
        </p>
      </div>
    </div>
  );
}
