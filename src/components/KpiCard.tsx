interface KpiCardProps {
  label: string;
  value: string;
  context?: string;
  tone?: "neutral" | "fg" | "plv" | "strategy";
}

export function KpiCard({ label, value, context, tone = "neutral" }: KpiCardProps) {
  return (
    <article className={`kpi-card kpi-card-${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      {context ? <span>{context}</span> : null}
    </article>
  );
}
