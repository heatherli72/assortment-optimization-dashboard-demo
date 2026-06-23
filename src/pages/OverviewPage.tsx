import { dashboardPages } from "../domain/pages";
import type { DashboardPageId, DashboardPageMeta } from "../domain/types";

interface OverviewPageProps {
  onNavigate: (pageId: DashboardPageId) => void;
}

type FrameworkGroup =
  | { title: string; kind: "pages"; className: string; pages: DashboardPageMeta[] }
  | {
      title: string;
      kind: "questions";
      className: string;
      questions: Array<{ title: string; description: string }>;
    };

const groups: FrameworkGroup[] = [
  {
    title: "Product (FG)",
    kind: "pages",
    className: "framework-fg",
    pages: dashboardPages.filter((page) => page.group === "Product (FG)"),
  },
  {
    title: "Strategic Logic",
    kind: "questions",
    className: "framework-strategy",
    questions: [
      { title: "Where is the Money?", description: "Start with portfolio value concentration." },
      { title: "Is Complexity Justified?", description: "Test whether variety is earning its keep." },
      { title: "What Should We Keep, Review, or Simplify?", description: "Move from diagnosis to SKU-level action." },
    ],
  },
  {
    title: "Sample (PLV)",
    kind: "pages",
    className: "framework-plv",
    pages: dashboardPages.filter((page) => page.group === "Sample (PLV)"),
  },
];

export function OverviewPage({ onNavigate }: OverviewPageProps) {
  return (
    <main className="page overview-page cover-page">
      <section className="page-hero">
        <div>
          <p className="eyebrow">Analytics framework</p>
          <h2>Assortment Optimization Analytics Framework</h2>
          <p>
            A practical navigation model for finding value concentration, diagnosing complexity, and
            turning SKU or PLV issues into keep, review, or simplify actions.
          </p>
        </div>
      </section>
      <section className="framework-grid" aria-label="Analytics framework">
        {groups.map((group) => (
          <div className={`framework-column ${group.className}`} key={group.title}>
            <h3>{group.title}</h3>
            {group.kind === "pages"
              ? group.pages.map((page) => (
                  <button
                    className="framework-module"
                    key={`${group.title}-${page.id}`}
                    type="button"
                    onClick={() => onNavigate(page.id)}
                  >
                    <span>{page.title}</span>
                    <small>{page.description}</small>
                    <b aria-hidden="true">Open analysis &gt;</b>
                  </button>
                ))
              : group.questions.map((question) => (
                  <div className="framework-question" key={question.title}>
                    <span>{question.title}</span>
                    <small>{question.description}</small>
                  </div>
                ))}
          </div>
        ))}
      </section>
    </main>
  );
}
