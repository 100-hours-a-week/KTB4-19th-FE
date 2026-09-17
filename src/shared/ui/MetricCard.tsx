export function MetricCard({ label, value, helper, tone = "default" }: { label: string; value: string | number; helper?: string; tone?: "default" | "brand" }) {
  return (
    <article className={`metric-card ${tone === "brand" ? "metric-card--brand" : ""}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      {helper && <span>{helper}</span>}
    </article>
  );
}
