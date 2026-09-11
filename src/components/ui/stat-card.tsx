export function StatCard({
  icon,
  value,
  label,
}: {
  icon: string
  value: string | number
  label: string
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}
