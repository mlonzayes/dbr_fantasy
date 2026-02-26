"use client"

import { useState, useRef } from "react"
import { FaFileExcel } from "react-icons/fa"

interface BulkUploadResult {
    processed: number
    errors: string[]
}

export default function AdminBulkPlayerForm({ onPlayersAdded }: { onPlayersAdded?: () => void }) {
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<BulkUploadResult | null>(null)
    const [error, setError] = useState<string | null>(null)

    const fileRef = useRef<HTMLInputElement>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) return
        setLoading(true)
        setResult(null)
        setError(null)

        try {
            const formData = new FormData()
            formData.append("file", file)

            const res = await fetch("/api/admin/players/bulk", {
                method: "POST",
                body: formData,
            })

            const data = await res.json()
            if (res.ok) {
                setResult(data)
                setFile(null)
                if (fileRef.current) fileRef.current.value = ""
                if (onPlayersAdded) onPlayersAdded()
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
            <div className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Archivo Excel (.xlsx)
                    </label>
                    <input
                        type="file"
                        accept=".xlsx"
                        ref={fileRef}
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        required
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-light file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={!file || loading}
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded font-light text-sm disabled:opacity-40 hover:bg-slate-800 transition-colors"
            >
                <FaFileExcel />
                {loading ? "Procesando..." : "Subir archivo Excel"}
            </button>

            {result && (
                <div className="bg-slate-50 border border-slate-200 rounded p-4 text-sm font-light">
                    <p className="text-emerald-800 font-medium">
                        ✓ {result.processed} jugadores creados exitosamente.
                    </p>
                    {result.errors.length > 0 && (
                        <div className="mt-2 text-red-600">
                            <p className="font-medium text-sm">Hubo {result.errors.length} errores al procesar el archivo:</p>
                            <ul className="text-sm list-disc list-inside mt-1">
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
                    <p className="text-red-700 text-sm font-light">✕ {error}</p>
                </div>
            )}
        </form>
    )
}
