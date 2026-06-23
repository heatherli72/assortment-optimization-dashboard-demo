import type { ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { dashboardPages } from "../domain/pages";
import type { DashboardPageId } from "../domain/types";

interface AppShellProps {
  currentPageId: DashboardPageId;
  onNavigate: (pageId: DashboardPageId) => void;
  onClearFilters: () => void;
  children: ReactNode;
}

export function AppShell({ currentPageId, onNavigate, onClearFilters, children }: AppShellProps) {
  const productPages = dashboardPages.filter((page) => page.group === "Product (FG)");
  const samplePages = dashboardPages.filter((page) => page.group === "Sample (PLV)");
  const overview = dashboardPages.find((page) => page.id === "overview");

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Dashboard navigation">
        <div className="sidebar-brand">
          <div className="brand-mark" aria-hidden="true">
            <span>AO</span>
          </div>
          <div className="sidebar-title">
            <h1>Assortment Optimization Analytics</h1>
          </div>
        </div>
        <nav aria-label="Dashboard pages" className="side-nav">
          {overview ? (
            <button
              className="side-nav-framework"
              type="button"
              aria-current={overview.id === currentPageId ? "page" : undefined}
              onClick={() => onNavigate(overview.id)}
            >
              <span aria-hidden="true" className="nav-badge nav-badge-framework">F</span>
              <span className="nav-copy">
                <strong>Framework</strong>
                {overview.id === currentPageId ? <small aria-hidden="true">{overview.description}</small> : null}
              </span>
            </button>
          ) : null}
          <p className="nav-section-label">Product FG</p>
          {productPages.map((page, index) => (
            <button
              key={page.id}
              type="button"
              aria-current={page.id === currentPageId ? "page" : undefined}
              onClick={() => onNavigate(page.id)}
            >
              <span aria-hidden="true" className="nav-badge nav-badge-fg">{index + 1}</span>
              <span className="nav-copy">
                <strong>{page.title}</strong>
                {page.id === currentPageId ? <small aria-hidden="true">{page.description}</small> : null}
              </span>
            </button>
          ))}
          <div className="nav-separator" />
          <p className="nav-section-label">Sample PLV</p>
          {samplePages.map((page, index) => (
            <button
              key={page.id}
              type="button"
              aria-current={page.id === currentPageId ? "page" : undefined}
              onClick={() => onNavigate(page.id)}
            >
              <span aria-hidden="true" className="nav-badge nav-badge-plv">{index + 4}</span>
              <span className="nav-copy">
                <strong>{page.title}</strong>
                {page.id === currentPageId ? <small aria-hidden="true">{page.description}</small> : null}
              </span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button type="button" onClick={onClearFilters}>
            <RotateCcw size={15} aria-hidden="true" />
            Clear all filters
          </button>
        </div>
      </aside>
      <div className="app-main">{children}</div>
    </div>
  );
}
