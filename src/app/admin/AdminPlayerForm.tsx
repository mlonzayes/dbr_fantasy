"use client"

import { useState, useRef } from "react"
import Image from "next/image"
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

const DIVISIONS = ["Primera", "Intermedia", "Pre A", "Pre B", "Pre C", "Pre D"]

export default function AdminPlayerForm({ onPlayerAdded }: { onPlayerAdded?: () => void }) {
    const [name, setName] = useState("")
    const [position, setPosition] = useState(POSITIONS[0])
    const [division, setDivision] = useState(DIVISIONS[0])
    const [price, setPrice] = useState<number>(50)
    const [image, setImage] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const fileRef = useRef<HTMLInputElement>(null)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null
        setImage(file)
        if (file) {
            const url = URL.createObjectURL(file)
            setPreview(url)
        } else {
            setPreview(null)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            // 1. Crear el jugador
            const res = await fetch("/api/admin/players", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, position, price, division }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "No se pudo crear el jugador")
                return
            }

            const playerId: number = data.player.id

            // 2. Subir imagen si se seleccionó una
            if (image) {
                const formData = new FormData()
                formData.append("playerId", String(playerId))
                formData.append("image", image)

                const imgRes = await fetch("/api/admin/players/image", {
                    method: "POST",
                    body: formData,
                })

                if (!imgRes.ok) {
                    const imgData = await imgRes.json()
                    setError(`Jugador creado (ID: ${playerId}) pero falló la imagen: ${imgData.error}`)
                    return
                }
            }

            setSuccess(`Jugador ${data.player.name} creado correctamente (ID: ${playerId}).`)
            setName("")
            setPosition(POSITIONS[0])
            setPrice(50)
            setImage(null)
            setPreview(null)
            if (fileRef.current) fileRef.current.value = ""
            if (onPlayerAdded) onPlayerAdded()
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
                            <option key={pos} value={pos}>{pos}</option>
                        ))}
                    </select>
                </div>
                <div className="w-full sm:w-40">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        División
                    </label>
                    <select
                        value={division}
                        onChange={(e) => setDivision(e.target.value)}
                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-light bg-white text-slate-900"
                    >
                        {DIVISIONS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Imagen del jugador */}
            <div className="flex items-start gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Foto del jugador <span className="text-slate-400 font-light">(opcional)</span>
                    </label>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-light file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
                    />
                    <p className="text-xs text-slate-400 mt-1 font-light">Se convierte automáticamente a WebP (400×400)</p>
                </div>
                {preview && (
                    <div className="shrink-0">
                        <Image
                            src={preview}
                            alt="Preview"
                            width={64}
                            height={64}
                            className="w-16 h-16 rounded object-cover border border-slate-200"
                            unoptimized
                        />
                    </div>
                )}
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
