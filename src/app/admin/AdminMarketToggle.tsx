"use client"

import { useEffect, useState } from "react"

export default function AdminMarketToggle() {
    const [marketOpen, setMarketOpen] = useState<boolean | null>(null)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

    useEffect(() => {
        fetch("/api/admin/market")
            .then((r) => r.json())
            .then((d) => setMarketOpen(d.marketOpen))
            .catch(() => setMarketOpen(false))
    }, [])

    const toggle = async (open: boolean) => {
        setLoading(true)
        setMessage(null)
        try {
            const res = await fetch("/api/admin/market", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ open }),
            })
            const data = await res.json()
            if (res.ok) {
                setMarketOpen(data.marketOpen)
                setMessage(data.marketOpen ? "✓ Mercado abierto" : "✓ Mercado cerrado")
            } else {
                setMessage(`Error: ${data.error}`)
            }
        } catch {
            setMessage("Error de red")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <div>
                    <h2 className="text-lg font-light text-slate-800">Estado del Mercado</h2>
                    <p className="text-sm text-slate-400 mt-0.5">
                        Abrí el mercado luego de cargar los precios y puntos actualizados.
                    </p>
                </div>
                {/* Status badge */}
                {marketOpen === null ? (
                    <span className="text-sm text-slate-400">Cargando...</span>
                ) : (
                    <span
                        className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full ${marketOpen
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                    >
                        <span
                            className={`w-2 h-2 rounded-full ${marketOpen ? "bg-emerald-500" : "bg-red-500"
                                }`}
                        />
                        {marketOpen ? "Abierto" : "Cerrado"}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={() => toggle(true)}
                    disabled={loading || marketOpen === true}
                    className="bg-emerald-600 text-white px-5 py-2 rounded text-sm font-light hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Abrir mercado
                </button>
                <button
                    onClick={() => toggle(false)}
                    disabled={loading || marketOpen === false}
                    className="bg-slate-800 text-white px-5 py-2 rounded text-sm font-light hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Cerrar mercado
                </button>
                {loading && <span className="text-slate-400 text-sm">Guardando...</span>}
                {message && !loading && (
                    <span
                        className={`text-sm ${message.startsWith("✓") ? "text-emerald-700" : "text-red-600"
                            }`}
                    >
                        {message}
                    </span>
                )}
            </div>
        </div>
    )
}
