"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminNotificationForm() {
  const router = useRouter()
  const [form, setForm] = useState({ title: "", message: "" })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ ok?: boolean; error?: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setResult({ ok: true })
        setForm({ title: "", message: "" })
        router.refresh()
      } else {
        setResult({ error: data.error || "Error al enviar" })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Título</label>
        <input
          type="text"
          placeholder="Ej: ¡Mercado abierto!"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
          className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Mensaje</label>
        <textarea
          rows={3}
          placeholder="Escribí el mensaje para todos los usuarios..."
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          required
          className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
        />
      </div>
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-slate-900 text-white px-5 py-2 rounded text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
        >
          {loading ? "Enviando..." : "Enviar a todos"}
        </button>
        {result?.ok && <p className="text-emerald-600 text-sm">Notificación enviada.</p>}
        {result?.error && <p className="text-red-600 text-sm">{result.error}</p>}
      </div>
    </form>
  )
}
