"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminCalendarForm() {
  const router = useRouter()
  const [form, setForm] = useState({ round: "", homeTeam: "", awayTeam: "", stadium: "", date: "" })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ ok?: boolean; error?: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/admin/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setResult({ ok: true })
        setForm({ round: "", homeTeam: "", awayTeam: "", stadium: "", date: "" })
        router.refresh()
      } else {
        setResult({ error: data.error || "Error al crear partido" })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Jornada / Fecha</label>
        <input
          type="text"
          placeholder="Ej: Fecha 1, Semifinal"
          value={form.round}
          onChange={(e) => setForm({ ...form, round: e.target.value })}
          required
          className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Estadio / Sede</label>
        <input
          type="text"
          placeholder="Ej: Estadio Malvinas Argentinas"
          value={form.stadium}
          onChange={(e) => setForm({ ...form, stadium: e.target.value })}
          required
          className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Equipo Local</label>
        <input
          type="text"
          placeholder="Ej: Pampas"
          value={form.homeTeam}
          onChange={(e) => setForm({ ...form, homeTeam: e.target.value })}
          required
          className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Equipo Visitante</label>
        <input
          type="text"
          placeholder="Ej: Jaguares XV"
          value={form.awayTeam}
          onChange={(e) => setForm({ ...form, awayTeam: e.target.value })}
          required
          className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-slate-600 mb-1">Fecha y Hora</label>
        <input
          type="datetime-local"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
          className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
      </div>
      <div className="sm:col-span-2 flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-slate-900 text-white px-5 py-2 rounded text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
        >
          {loading ? "Guardando..." : "Agregar Partido"}
        </button>
        {result?.ok && <p className="text-emerald-600 text-sm">Partido agregado.</p>}
        {result?.error && <p className="text-red-600 text-sm">{result.error}</p>}
      </div>
    </form>
  )
}
