
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  useNavigate,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";

import { useEffect, useState, type ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { request } from "@/services/http";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

// --------------------------------------------------
// Página 404
// --------------------------------------------------

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>

        <h2 className="mt-4 text-xl font-semibold">
          Page not found
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------
// Tratamento de erros
// --------------------------------------------------

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);

  const router = useRouter();

  useEffect(() => {
    reportLovableError(error, {
      boundary: "tanstack_root_error_component",
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>

          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------
// Configuração principal do Jack
// --------------------------------------------------

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { title: "Jack — Personal AI OS" },
      {
        name: "description",
        content: "Jack, seu assistente pessoal de IA modular.",
      },
      { property: "og:title", content: "Jack — Personal AI OS" },
      {
        property: "og:description",
        content: "Jack, seu assistente pessoal de IA modular.",
      },
      { property: "og:type", content: "website" },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
    ],

    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        href: "/favicon.ico",
        type: "image/x-icon",
      },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

// --------------------------------------------------
// Estrutura HTML principal
// --------------------------------------------------

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>

      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

// --------------------------------------------------
// Proteção das rotas
// --------------------------------------------------

function AuthGuard({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const isPublicRoute = pathname === "/";

  const [authState, setAuthState] = useState<{
    pathname: string;
    authenticated: boolean;
  } | null>(null);

  useEffect(() => {
    if (isPublicRoute) {
      return;
    }

    let cancelled = false;

    async function verifyAuth() {
      const token = window.localStorage.getItem("paios.token");

      // Sem token: retorna para o login
      if (!token) {
        void navigate({
          to: "/",
          replace: true,
        });
        return;
      }

      try {
        // Confirma o token diretamente no FastAPI
        await request("/auth/me");

        if (!cancelled) {
          setAuthState({
            pathname,
            authenticated: true,
          });
        }
      } catch {
        if (!cancelled) {
          // Remove o token inválido ou expirado
          window.localStorage.removeItem("paios.token");

          setAuthState(null);

          void navigate({
            to: "/",
            replace: true,
          });
        }
      }
    }

    void verifyAuth();

    return () => {
      cancelled = true;
    };
  }, [pathname, isPublicRoute, navigate]);

  // Login continua sendo uma página pública
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Aguarda a validação do token
  if (
    !authState ||
    authState.pathname !== pathname ||
    !authState.authenticated
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">
          Verificando autenticação...
        </p>
      </div>
    );
  }

  // Usuário autenticado: libera a página
  return <>{children}</>;
}

// --------------------------------------------------
// Componente raiz da aplicação
// --------------------------------------------------

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard>
        <Outlet />
      </AuthGuard>

      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
