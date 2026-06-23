interface KpiCardProps {
  label: string;
  value: string;
  context?: string;
  tone?: "neutral" | "fg" | "plv" | "strategy";
  group?: "value" | "volume" | "cost" | "mix";
}

export function KpiCard({ label, value, context, tone = "neutral", group }: KpiCardProps) {
  return (
    <article className={`kpi-card kpi-card-${tone}${group ? ` kpi-group-${group}` : ""}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      {context ? <span>{context}</span> : null}
    </article>
  );
}
