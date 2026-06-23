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
      <aside className="sidebar" aria-label="Dashboard navigation">
        <div className="sidebar-title">
          <p className="topbar-kicker">Dashboard demo</p>
          <h1>Assortment Optimization</h1>
        </div>
        <nav aria-label="Dashboard pages" className="side-nav">
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
      </aside>
      <div className="app-main">{children}</div>
    </div>
  );
}
