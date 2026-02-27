"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

const TABS = [
  { key: "puntos", label: "Puntos" },
  { key: "jugadores", label: "Jugadores" },
  { key: "calendario", label: "Calendario" },
  { key: "notificaciones", label: "Notificaciones" },
  { key: "usuarios", label: "Usuarios" },
]

export default function AdminTabs() {
  const searchParams = useSearchParams()
  const active = searchParams.get("tab") || "puntos"

  return (
    <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1 mb-8 overflow-x-auto shadow-sm">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={`/admin?tab=${tab.key}`}
          className={`px-4 py-2 rounded text-sm font-medium whitespace-nowrap transition-colors ${
            active === tab.key
              ? "bg-slate-900 text-white"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}
