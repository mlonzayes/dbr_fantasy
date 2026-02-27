"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { FaUserTie } from "react-icons/fa"

export default function AdminCoachForm({ onCoachAdded }: { onCoachAdded?: () => void }) {
    const [name, setName] = useState("")
    const [image, setImage] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const fileRef = useRef<HTMLInputElement>(null)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null
        setImage(file)
        setPreview(file ? URL.createObjectURL(file) : null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            const res = await fetch("/api/admin/coaches", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            })
            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "No se pudo crear el entrenador")
                return
            }

            if (image) {
                const formData = new FormData()
                formData.append("coachId", String(data.coach.id))
                formData.append("image", image)
                const imgRes = await fetch("/api/admin/coaches/image", { method: "POST", body: formData })
                if (!imgRes.ok) {
                    const imgData = await imgRes.json()
                    setError(`Entrenador creado (ID: ${data.coach.id}) pero falló la imagen: ${imgData.error}`)
                    return
                }
            }

            setSuccess(`Entrenador ${data.coach.name} creado correctamente (ID: ${data.coach.id}).`)
            setName("")
            setImage(null)
            setPreview(null)
            if (fileRef.current) fileRef.current.value = ""
            if (onCoachAdded) onCoachAdded()
        } catch {
            setError("Error de conexión al servidor")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                    <input
                        type="text"
                        required
                        placeholder="Ej: Mario Ledesma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-light text-slate-900"
                    />
                </div>
            </div>

            <div className="flex items-start gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Foto <span className="text-slate-400 font-light">(opcional)</span>
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
                    <Image src={preview} alt="Preview" width={64} height={64} className="w-16 h-16 rounded object-cover border border-slate-200 shrink-0" unoptimized />
                )}
            </div>

            <button
                type="submit"
                disabled={!name.trim() || loading}
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded font-light text-sm disabled:opacity-40 hover:bg-slate-800 transition-colors"
            >
                <FaUserTie />
                {loading ? "Creando..." : "Crear Entrenador"}
            </button>

            {success && (
                <div className="bg-emerald-50 border border-emerald-200 rounded p-4 text-sm font-light">
                    <p className="text-emerald-800 font-medium">✓ {success}</p>
                </div>
            )}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded p-4 text-sm font-light">
                    <p className="text-red-700 font-medium">✕ {error}</p>
                </div>
            )}
        </form>
    )
}
