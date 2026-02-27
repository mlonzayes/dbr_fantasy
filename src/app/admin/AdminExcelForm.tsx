"use client"

import { useState } from "react"
import { FaDownload, FaUpload, FaCheckCircle } from "react-icons/fa"

interface ImportResult {
  processedStats: number
  processedDivisions: number
  errors: string[]
  week: number | null
  year: number | null
}

export default function AdminExcelForm() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const res = await fetch("/api/admin/excel")
      if (!res.ok) { setError("Error al descargar template"); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "jugadores_semana.xlsx"
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError("Error de red al descargar")
    } finally {
      setDownloading(false)
    }
  }

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/admin/excel", { method: "POST", body: formData })
      const data = await res.json()
      if (res.ok) {
        setResult(data)
        setFile(null)
        const input = document.getElementById("excel-file-input") as HTMLInputElement
        if (input) input.value = ""
      } else {
        setError(data.error || "Error al importar")
      }
    } catch {
      setError("Error de red")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Descargar template */}
      <div className="bg-white rounded border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-light text-slate-800 mb-1 pb-2 border-b border-slate-100">
          Descargar Template
        </h2>
        <p className="text-sm text-slate-500 mb-4 font-light">
          Descargá el Excel con todos los jugadores (ID, nombre, posición, división). Completá{" "}
          <span className="font-medium text-slate-700">semana</span>,{" "}
          <span className="font-medium text-slate-700">año</span> y{" "}
          <span className="font-medium text-slate-700">puntos</span> para cargar stats semanales.
          También podés actualizar la columna{" "}
          <span className="font-medium text-slate-700">division</span> de cada jugador.
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs font-mono text-slate-600 mb-4 overflow-x-auto">
          <span className="text-blue-600 font-semibold">id</span> |{" "}
          <span className="text-slate-500">nombre</span> |{" "}
          <span className="text-slate-500">posicion</span> |{" "}
          <span className="text-emerald-600 font-semibold">division</span> |{" "}
          <span className="text-emerald-600 font-semibold">semana</span> |{" "}
          <span className="text-emerald-600 font-semibold">año</span> |{" "}
          <span className="text-emerald-600 font-semibold">puntos</span>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded font-light text-sm disabled:opacity-40 transition-colors"
        >
          <FaDownload />
          {downloading ? "Descargando..." : "Descargar jugadores_semana.xlsx"}
        </button>
      </div>

      {/* Importar */}
      <div className="bg-white rounded border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-light text-slate-800 mb-1 pb-2 border-b border-slate-100">
          Importar desde Excel
        </h2>
        <p className="text-sm text-slate-500 mb-4 font-light">
          Subí el archivo completado. Se actualizarán divisiones y/o stats semanales según las columnas que hayas llenado.
        </p>
        <form onSubmit={handleImport} className="space-y-4">
          <input
            id="excel-file-input"
            type="file"
            accept=".xlsx"
            required
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-light file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
          />
          <button
            type="submit"
            disabled={!file || loading}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded font-light text-sm disabled:opacity-40 transition-colors"
          >
            <FaUpload />
            {loading ? "Procesando..." : "Importar Excel"}
          </button>
        </form>

        {result && (
          <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded p-4 text-sm space-y-1">
            <p className="text-emerald-800 font-medium flex items-center gap-2">
              <FaCheckCircle /> Importación completada
            </p>
            {result.processedStats > 0 && (
              <p className="text-emerald-700 font-light">
                ✓ {result.processedStats} stats cargados
                {result.week && result.year ? ` — Semana ${result.week}/${result.year}` : ""}
              </p>
            )}
            {result.processedDivisions > 0 && (
              <p className="text-emerald-700 font-light">
                ✓ {result.processedDivisions} divisiones actualizadas
              </p>
            )}
            {result.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-red-600 font-medium">Errores ({result.errors.length}):</p>
                <ul className="text-red-600 font-light list-disc list-inside text-xs mt-1 space-y-0.5">
                  {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
