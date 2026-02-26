"use client"

import { useState } from "react"

interface UploadResult {
  processed: number
  errors: string[]
  week: number
  year: number
}

export default function AdminUploadForm() {
  const [week, setWeek] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      if (week) formData.append("week", week)

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (res.ok) {
        setResult(data)
      } else {
        setError(data.error || "Error al subir el archivo")
      }
    } catch {
      setError("Error de red")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Archivo Excel (.xlsx)
          </label>
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-light file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
          />
        </div>
        <div className="w-full sm:w-40">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Semana (opcional)
          </label>
          <input
            type="number"
            placeholder="Auto"
            value={week}
            onChange={(e) => setWeek(e.target.value)}
            min={1}
            max={53}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!file || loading}
        className="bg-slate-900 text-white px-6 py-2 rounded font-light text-sm disabled:opacity-40 hover:bg-slate-800 transition-colors"
      >
        {loading ? "Subiendo..." : "Subir puntos"}
      </button>

      {result && (
        <div className="bg-slate-50 border border-slate-200 rounded p-4 text-sm font-light">
          <p className="text-green-800 font-medium">
            ✓ {result.processed} jugadores procesados — Semana {result.week}/{result.year}
          </p>
          {result.errors.length > 0 && (
            <div className="mt-2">
              <p className="text-red-600 text-sm font-medium">Errores:</p>
              <ul className="text-red-600 text-sm list-disc list-inside">
                {result.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </form>
  )
}
