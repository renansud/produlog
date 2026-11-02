"use client";

import { createContext, useContext, useOptimistic, useState, useTransition, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { dashboardStateQueryString, transitionDashboardState, type DashboardChange, type DashboardState } from "../domain/dashboard-state";

type StateContext = { query: DashboardState; selection: DashboardState; pending: boolean; message: string; change: (action: DashboardChange) => void; refresh: () => void };
const DashboardContext = createContext<StateContext | null>(null);

export function DashboardStateProvider({ query, children }: { query: DashboardState; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [selection, setSelection] = useOptimistic(query);
  const [message, setMessage] = useState("");
  function change(action: DashboardChange) {
    if (pending) return;
    let next: DashboardState;
    try { next = transitionDashboardState(selection, action); }
    catch { setMessage("Revise os parâmetros do detalhamento."); return; }
    setMessage("");
    const search = dashboardStateQueryString(next);
    startTransition(() => {
      setSelection(next);
      router.push(`${pathname}${search ? `?${search}` : ""}`, { scroll: false });
    });
  }
  return <DashboardContext.Provider value={{ query, selection, pending, message, change, refresh: () => startTransition(() => router.refresh()) }}>{children}</DashboardContext.Provider>;
}

export function useDashboardState() {
  const value = useContext(DashboardContext);
  if (!value) throw new Error("Controles fora do estado do painel.");
  return value;
}
