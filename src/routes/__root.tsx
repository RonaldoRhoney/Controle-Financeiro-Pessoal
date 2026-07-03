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
} from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import "@/lib/i18n";
import { FinwiseProvider, useFinwise } from "@/lib/finwise/store";
import { AppSidebar, MobileTopBar } from "@/components/finwise/AppSidebar";
import { Toaster } from "@/components/ui/sonner";
import rhoneyLogo from "@/assets/rhoneyinc-logo.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { logAccessOnce } from "@/lib/finwise/access-log";


const PUBLIC_ROUTES = ["/auth", "/reset-password", "/demo"];
// Routes that render without the sidebar chrome, even when logged out.
// `/` is special: it always mounts (Outlet decides landing vs dashboard),
// but for logged-out users it should render bare (no sidebar).
const CHROMELESS_WHEN_LOGGED_OUT = new Set(["/", "/demo", "/auth", "/reset-password"]);

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
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

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

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
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Controle Financeiro — Controle suas finanças com inteligência" },
      { name: "description", content: "App gratuito de finanças pessoais com IA: registre gastos por voz, defina metas, receba insights e relatórios mensais. Em português, sem cartão." },
      { name: "author", content: "RhoneyInc" },
      { name: "keywords", content: "controle financeiro, finanças pessoais, app finanças, orçamento pessoal, gastos, metas, IA financeira" },
      { property: "og:site_name", content: "Controle Financeiro" },
      { property: "og:title", content: "Controle Financeiro — Controle suas finanças com inteligência" },
      { property: "og:description", content: "App gratuito de finanças pessoais com IA: registre gastos por voz, defina metas e receba insights personalizados." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Controle Financeiro" },
      { name: "twitter:description", content: "App gratuito de finanças pessoais com IA, em português." },
    ],
  links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: rhoneyLogo.url },
      { rel: "apple-touch-icon", href: rhoneyLogo.url },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" },
    ],

  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <FinwiseProvider>
        <Shell />
        <Toaster richColors position="top-right" />
      </FinwiseProvider>
    </QueryClientProvider>
  );
}

function Shell() {
  const { session, loading } = useFinwise();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const isPublic = PUBLIC_ROUTES.includes(path);

  useEffect(() => {
    if (!loading && !session && !isPublic) navigate({ to: "/auth" });
  }, [loading, session, isPublic, navigate]);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, sess) => {
      if (event === "SIGNED_IN" && sess?.user) {
        const provider = (sess.user.app_metadata as any)?.provider as string | undefined;
        const method = provider === "google" ? "google" : provider === "apple" ? "apple" : provider === "email" ? "password" : "unknown";
        logAccessOnce(sess.user.id, sess.user.email ?? null, method);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (isPublic) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
        <div className="flex-1">
          <Outlet />
        </div>
        <Footer />
      </div>
    );
  }

  if (loading || !session) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Carregando…</div>;
  }

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar />
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 bg-sidebar/40 px-4 py-4">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 text-center text-xs text-muted-foreground sm:flex-row">
        <img src={rhoneyLogo.url} alt="RhoneyInc" className="h-5 w-5 rounded-sm object-contain" />
        <span>© {new Date().getFullYear()} <span className="font-medium text-foreground">@RhoneyInc</span> — Todos os direitos reservados.</span>
      </div>
    </footer>
  );
}

