interface BarChartItem {
  label: string
  value: number
}

export function BarChart({
  items,
  emptyMessage = 'No data yet.',
}: {
  items: BarChartItem[]
  emptyMessage?: string
}) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-600">{emptyMessage}</p>
  }

  const max = Math.max(...items.map((item) => item.value), 1)

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-gray-700">{item.label}</span>
            <span className="font-medium text-gray-900">{item.value}</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
