import { useRouterState } from "@tanstack/react-router";
import { type ReactNode } from "react";

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div key={pathname} className="animate-route-in">
      {children}
    </div>
  );
}
