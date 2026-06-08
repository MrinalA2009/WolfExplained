import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { CursorGlow } from "../components/CursorGlow";
import { RouteTransition } from "../components/RouteTransition";
import { NextSection } from "../components/NextSection";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="font-mono text-xs tracking-[0.3em] text-gold/80">ERR · 404</div>
        <h1 className="mt-3 font-display text-6xl font-light tracking-tight">Lost in the network</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This node doesn't exist in the WOLF graph.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-background"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl tracking-tight">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong on our end.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-full bg-gold px-4 py-2 text-sm font-medium text-background"
          >
            Try again
          </button>
          <a href="/" className="glass rounded-full px-4 py-2 text-sm">Go home</a>
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
      { title: "WOLF — Werewolf-based Observations for LLM Deception and Falsehoods" },
      { name: "description", content: "A research platform studying deception, trust, and social reasoning in LLMs through the lens of Werewolf — a social deduction game. arXiv 2512.09187." },
      { name: "author", content: "Mrinal Agarwal" },
      { property: "og:title", content: "WOLF — Werewolf-based Observations for LLM Deception and Falsehoods" },
      { property: "og:description", content: "Studying deception, trust, and social reasoning in AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&family=Inter:wght@300;400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

// Restores the URL path after the GitHub Pages 404.html SPA redirect
// (encodes paths as ?/deep/path to survive GitHub's 404 handler).
const spaRedirectRestore = `(function(l){if(l.search[1]==='/'){var d=l.search.slice(1).split('&').map(function(s){return s.replace(/~and~/g,'&')}).join('?');window.history.replaceState(null,null,l.pathname.slice(0,-1)+d+l.hash)}}(window.location))`;

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
        {/* Must run before React hydration to fix URL before router reads it */}
        <script dangerouslySetInnerHTML={{ __html: spaRedirectRestore }} />
      </head>
      <body>
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
      <CursorGlow />
      <Nav />
      <main className="relative">
        <RouteTransition>
          <Outlet />
          <NextSection />
        </RouteTransition>
      </main>
      <Footer />
    </QueryClientProvider>
  );
}
