"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import RugbyPitch from "@/components/RugbyPitch"
import { FaList, FaRegImage } from "react-icons/fa"

interface WeeklyStat {
  week: number
  year: number
  points: number
}

interface Player {
  id: number
  name: string
  position: string
  totalPoints: number
  currentPrice: number
  weeklyStats: WeeklyStat[]
}

interface TeamPlayer {
  player: Player
}

interface Team {
  id: string
  name: string
  createdAt: string
  players: TeamPlayer[]
}

interface TeamStatsResponse {
  team: Team | null
  user: {
    balance: number
  } | null
  isLocked: boolean
}

export default function TeamPage() {
  const [data, setData] = useState<TeamStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"list" | "pitch">("pitch")

  useEffect(() => {
    fetch("/api/team/stats")
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500 font-light">Cargando datos...</p>
      </div>
    )
  }

  const team = data?.team
  const user = data?.user
  const isLocked = data?.isLocked

  if (!team) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col gap-4">
        <p className="text-gray-600 text-lg font-light">Todavía no tenés equipo.</p>

        {isLocked ? (
          <div className="bg-orange-50 text-orange-800 border-orange-200 border p-4 rounded text-sm max-w-sm text-center">
            El mercado de pases se encuentra cerrado todos los sábados de 10:00 a 19:00 hs.
          </div>
        ) : (
          <Link
            href="/draft"
            className="bg-slate-900 text-white px-6 py-2 rounded font-light hover:bg-slate-800 transition-colors"
          >
            Armar equipo
          </Link>
        )}
      </div>
    )
  }

  const totalPoints = team.players.reduce((sum, tp) => sum + tp.player.totalPoints, 0)
  const portfolioValue = team.players.reduce((sum, tp) => sum + tp.player.currentPrice, 0)

  // Get all unique weeks across all players
  const weekSet = new Set<string>()
  team.players.forEach((tp) =>
    tp.player.weeklyStats.forEach((ws) => weekSet.add(`${ws.year}-${ws.week}`))
  )
  const weeks = Array.from(weekSet)
    .sort()
    .map((key) => {
      const [year, week] = key.split("-").map(Number)
      return { year, week }
    })

  return (
    <div className="w-full bg-gray-50 flex-1">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-light text-slate-900 tracking-wide">{team.name}</h1>
              {isLocked ? (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded border border-red-200 uppercase tracking-widest font-medium">Mercado Cerrado</span>
              ) : (
                <Link href="/draft" className="text-sm border border-slate-300 rounded px-2 py-1 text-slate-500 hover:text-slate-900 hover:border-slate-800 transition-colors">Modificar</Link>
              )}
            </div>
            <div className="flex gap-6 mt-2">
              <p className="text-red-600 text-lg font-medium">{totalPoints} <span className="text-xs font-light tracking-widest text-slate-500">PUNTOS</span></p>
              <p className="text-emerald-600 text-lg font-medium">${portfolioValue} <span className="text-xs font-light uppercase tracking-widest text-slate-500">VALOR</span></p>
              <p className="text-slate-800 text-lg font-medium">${user?.balance || 0} <span className="text-xs font-light uppercase tracking-widest text-slate-500">DISPONIBLE</span></p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm w-fit">
            <button
              onClick={() => setView("pitch")}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm transition-colors ${view === "pitch" ? "bg-slate-900 text-white font-light" : "text-slate-500 hover:text-slate-800"
                }`}
            >
              <FaRegImage />
              Cancha
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm transition-colors ${view === "list" ? "bg-slate-900 text-white font-light" : "text-slate-500 hover:text-slate-800"
                }`}
            >
              <FaList />
              Lista
            </button>
          </div>
        </div>

        {view === "pitch" ? (
          <div className="mb-12">
            {isLocked && (
              <div className="mb-4 bg-orange-50 text-orange-800 border-orange-200 border p-3 rounded text-sm text-center">
                El mercado de pases se encuentra cerrado todos los sábados de 10:00 a 19:00 hs.
              </div>
            )}
            <RugbyPitch
              players={team.players.map((tp) => ({
                id: tp.player.id,
                name: tp.player.name,
                position: tp.player.position,
                currentPrice: tp.player.currentPrice,
              }))}
            />
          </div>
        ) : (
          <div className="bg-white rounded border border-slate-200 mb-12 overflow-x-auto shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-light text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-semibold">Jugador</th>
                  <th className="text-left px-4 py-3 font-semibold">Posición</th>
                  <th className="text-right px-4 py-3 font-semibold">Precio</th>
                  <th className="text-right px-4 py-3 font-semibold">Puntos Totales</th>
                </tr>
              </thead>
              <tbody>
                {team.players
                  .sort((a, b) => b.player.totalPoints - a.player.totalPoints)
                  .map((tp) => (
                    <tr key={tp.player.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{tp.player.name}</td>
                      <td className="px-4 py-3 text-gray-500">{tp.player.position}</td>
                      <td className="px-4 py-3 text-right font-medium text-emerald-600">
                        ${tp.player.currentPrice}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-red-700">
                        {tp.player.totalPoints}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Weekly history */}
        {weeks.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Historial semanal</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
              <table className="text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">
                      Jugador
                    </th>
                    {weeks.map((w) => (
                      <th
                        key={`${w.year}-${w.week}`}
                        className="px-3 py-3 font-semibold text-center whitespace-nowrap"
                      >
                        S{w.week}/{w.year}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {team.players.map((tp) => (
                    <tr
                      key={tp.player.id}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-2 font-medium whitespace-nowrap">
                        {tp.player.name}
                      </td>
                      {weeks.map((w) => {
                        const stat = tp.player.weeklyStats.find(
                          (ws) => ws.week === w.week && ws.year === w.year
                        )
                        return (
                          <td
                            key={`${w.year}-${w.week}`}
                            className="px-3 py-2 text-center text-gray-600"
                          >
                            {stat ? stat.points : "—"}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
