"use client"

import { useState } from "react"
import { FaUserPlus } from "react-icons/fa"

const POSITIONS = [
    "Pilar",
    "Hooker",
    "Segunda línea",
    "Ala",
    "N°8",
    "Medio scrum",
    "Apertura",
    "Centro",
    "Wing",
    "Full",
]

export default function AdminPlayerForm({ onPlayerAdded }: { onPlayerAdded?: () => void }) {
    const [name, setName] = useState("")
    const [position, setPosition] = useState(POSITIONS[0])
    const [price, setPrice] = useState<number>(50)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            const res = await fetch("/api/admin/players", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, position, price }),
            })

            const data = await res.json()

            if (res.ok) {
                setSuccess(`Jugador ${data.player.name} creado correctamente (ID: ${data.player.id}).`)
                setName("")
                setPosition(POSITIONS[0])
                setPrice(50)
                if (onPlayerAdded) onPlayerAdded()
            } else {
                setError(data.error || "No se pudo crear el jugador")
            }
        } catch {
            setError("Error de conexión al servidor")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Nombre Completo
                    </label>
                    <input
                        type="text"
                        required
                        placeholder="Ej: Nicolás Sánchez"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-light text-slate-900"
                    />
                </div>
                <div className="w-full sm:w-32">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Precio ($)
                    </label>
                    <input
                        type="number"
                        required
                        min="1"
                        max="150"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-light text-slate-900"
                    />
                </div>
                <div className="w-full sm:w-48">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Posición
                    </label>
                    <select
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-light bg-white text-slate-900"
                    >
                        {POSITIONS.map((pos) => (
                            <option key={pos} value={pos}>
                                {pos}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <button
                type="submit"
                disabled={!name.trim() || loading}
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded font-light text-sm disabled:opacity-40 hover:bg-slate-800 transition-colors"
            >
                <FaUserPlus />
                {loading ? "Creando..." : "Crear Jugador"}
            </button>

            {success && (
                <div className="bg-emerald-50 border border-emerald-200 rounded p-4 text-sm font-light mt-4">
                    <p className="text-emerald-800 font-medium">✓ {success}</p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded p-4 text-sm font-light mt-4">
                    <p className="text-red-700 font-medium">✕ {error}</p>
                </div>
            )}
        </form>
    )
}
