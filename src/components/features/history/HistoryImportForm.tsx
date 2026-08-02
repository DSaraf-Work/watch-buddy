'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'

interface HistoryImportFormProps {
  onImported: () => void
}

export function HistoryImportForm({ onImported }: HistoryImportFormProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setError(null)
    setResult(null)

    try {
      const form = new FormData()
      form.append('file', file)
      const response = await fetch('/api/history/import', { method: 'POST', body: form })
      const data = (await response.json()) as {
        imported?: number
        skipped?: number
        errors?: string[]
        error?: string
      }

      if (!response.ok) {
        throw new Error(data.error ?? 'Import failed')
      }

      setResult(`Imported ${data.imported ?? 0} entries (${data.skipped ?? 0} skipped).`)
      if (data.errors?.length) {
        setResult((prev) => `${prev} ${data.errors!.slice(0, 3).join(' ')}`)
      }
      onImported()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Import from CSV</h2>
      <p className="mb-4 text-sm text-gray-600">
        Columns: <code className="text-xs">content_id</code>, <code className="text-xs">watched_at</code>, optional{' '}
        <code className="text-xs">rating</code>, <code className="text-xs">review</code>,{' '}
        <code className="text-xs">is_rewatch</code>, <code className="text-xs">platform_id</code>
      </p>
      <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} disabled={importing} />
      <Button type="button" variant="outline" isLoading={importing} onClick={() => inputRef.current?.click()}>
        Choose CSV file
      </Button>
      {result && <p className="mt-3 text-sm text-green-700">{result}</p>}
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
    </section>
  )
}
