'use client'

interface SearchFiltersProps {
  selectedType: 'all' | 'movie' | 'series'
  onTypeChange: (type: 'all' | 'movie' | 'series') => void
}

export function SearchFilters({ selectedType, onTypeChange }: SearchFiltersProps) {
  const filters = [
    { value: 'all', label: 'All' },
    { value: 'movie', label: 'Movies' },
    { value: 'series', label: 'TV Series' },
  ] as const

  return (
    <div className="flex gap-2">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onTypeChange(filter.value)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedType === filter.value
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}

