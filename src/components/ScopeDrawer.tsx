import { Info, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

interface ScopeDrawerProps {
  title: string;
  sections: Array<{ heading: string; body: string[] }>;
}

export function ScopeDrawer({ title, sections }: ScopeDrawerProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button className="scope-button" type="button" onClick={() => setOpen(true)}>
        <Info size={16} aria-hidden="true" />
        Scope & definitions
      </button>
      {open ? (
        <div className="drawer-backdrop" onMouseDown={() => setOpen(false)}>
          <aside
            aria-labelledby={titleId}
            aria-modal="true"
            className="scope-drawer"
            role="dialog"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="drawer-head">
              <h2 id={titleId}>{title}</h2>
              <button aria-label="Close scope drawer" className="icon-button" type="button" onClick={() => setOpen(false)}>
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="drawer-content">
              {sections.map((section) => (
                <section key={section.heading}>
                  <h3>{section.heading}</h3>
                  <ul>
                    {section.body.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
