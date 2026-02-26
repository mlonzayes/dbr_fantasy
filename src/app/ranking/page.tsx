"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"

interface RankingEntry {
  position: number
  teamName: string
  ownerName: string
  totalPoints: number
  userId: string
}

export default function RankingPage() {
  const { user } = useUser()
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/ranking")
      .then((r) => r.json())
      .then((data) => {
        setRanking(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Cargando ranking...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Ranking</h1>

        {ranking.length === 0 ? (
          <p className="text-gray-500">Todavía no hay equipos registrados.</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-green-700 text-white">
                  <th className="px-4 py-3 text-center font-semibold w-12">#</th>
                  <th className="px-4 py-3 text-left font-semibold">Equipo</th>
                  <th className="px-4 py-3 text-left font-semibold">Dueño</th>
                  <th className="px-4 py-3 text-right font-semibold">Puntos</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((entry) => {
                  const isMe = user?.id === entry.userId
                  return (
                    <tr
                      key={entry.userId}
                      className={`border-t border-gray-100 ${
                        isMe ? "bg-green-50 font-semibold" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-3 text-center text-gray-500 font-medium">
                        {entry.position === 1
                          ? "🥇"
                          : entry.position === 2
                          ? "🥈"
                          : entry.position === 3
                          ? "🥉"
                          : entry.position}
                      </td>
                      <td className="px-4 py-3">
                        {entry.teamName}
                        {isMe && (
                          <span className="ml-2 text-xs text-green-700 font-normal">(vos)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{entry.ownerName}</td>
                      <td className="px-4 py-3 text-right font-semibold text-green-700">
                        {entry.totalPoints}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
