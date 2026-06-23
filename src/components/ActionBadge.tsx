import type { ActionStatus } from "../domain/types";

export function ActionBadge({ action }: { action: ActionStatus }) {
  return <span className={`action-badge action-${action.toLowerCase()}`}>{action}</span>;
}
