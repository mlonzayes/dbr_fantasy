"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

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
  weeklyStats: WeeklyStat[]
}

interface TeamPlayer {
  player: Player
}

interface Team {
  id: string
  name: string
  players: TeamPlayer[]
}

export default function TeamPage() {
  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/team/stats")
      .then((r) => r.json())
      .then((data) => {
        setTeam(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Cargando equipo...</p>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col gap-4">
        <p className="text-gray-600 text-lg">Todavía no tenés equipo.</p>
        <Link
          href="/draft"
          className="bg-green-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-800 transition-colors"
        >
          Armar equipo
        </Link>
      </div>
    )
  }

  const totalPoints = team.players.reduce((sum, tp) => sum + tp.player.totalPoints, 0)

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
          <p className="text-green-700 text-xl font-semibold">{totalPoints} puntos totales</p>
        </div>

        {/* Player totals table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-green-700 text-white">
                <th className="text-left px-4 py-3 font-semibold">Jugador</th>
                <th className="text-left px-4 py-3 font-semibold">Posición</th>
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
                    <td className="px-4 py-3 text-right font-semibold text-green-700">
                      {tp.player.totalPoints}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

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
