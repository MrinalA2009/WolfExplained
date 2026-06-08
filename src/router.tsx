import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  // Strip trailing slash from Vite's BASE_URL ("/WolfExplained/" → "/WolfExplained")
  // Falls back to "/" for local dev (BASE_URL = "/").
  const basepath =
    import.meta.env.BASE_URL === "/" || !import.meta.env.BASE_URL
      ? "/"
      : import.meta.env.BASE_URL.replace(/\/+$/, "");

  const router = createRouter({
    routeTree,
    basepath,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
