import type { ReactNode } from "react";
import { dashboardPages } from "../domain/pages";
import type { DashboardPageId } from "../domain/types";

interface AppShellProps {
  currentPageId: DashboardPageId;
  onNavigate: (pageId: DashboardPageId) => void;
  children: ReactNode;
}

export function AppShell({ currentPageId, onNavigate, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-title">
          <p className="topbar-kicker">Dashboard demo</p>
          <h1>Assortment Optimization</h1>
        </div>
        <nav aria-label="Dashboard pages" className="topnav">
          {dashboardPages.map((page) => (
            <button
              key={page.id}
              type="button"
              aria-current={page.id === currentPageId ? "page" : undefined}
              onClick={() => onNavigate(page.id)}
            >
              {page.title}
            </button>
          ))}
        </nav>
      </header>
      {children}
    </div>
  );
}
