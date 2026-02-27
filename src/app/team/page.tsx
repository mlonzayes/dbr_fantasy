"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import RugbyPitch from "@/components/RugbyPitch"
import Modal from "@/components/Modal"
import { FaList, FaRegImage, FaTimes } from "react-icons/fa"

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

const POSITION_ORDER = ["Pilar", "Hooker", "Segunda línea", "Ala", "N°8", "Medio scrum", "Apertura", "Centro", "Wing", "Full"]

function PlayerFicha({ player, onClose, isTransferOpen, onSell }: {
  player: Player
  onClose: () => void
  isTransferOpen: boolean
  onSell: (playerId: number) => Promise<void>
}) {
  const [selling, setSelling] = useState(false)
  const [confirmModal, setConfirmModal] = useState(false)

  const handleSell = async () => {
    setConfirmModal(false)
    setSelling(true)
    try {
      await onSell(player.id)
    } finally {
      setSelling(false)
    }
  }

  return (
    <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
      <Modal
        isOpen={confirmModal}
        title="Vender jugador"
        message={`¿Vender a ${player.name} por $${player.currentPrice}?`}
        onCancel={() => setConfirmModal(false)}
        onConfirm={handleSell}
        confirmLabel="Vender"
        variant="danger"
      />
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
        <div>
          <p className="font-semibold text-slate-800 text-sm">{player.name}</p>
          <p className="text-xs text-slate-500">{player.position}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 transition-colors">
          <FaTimes className="text-xs" />
        </button>
      </div>
      <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100">
        <div className="text-center py-3">
          <p className="text-xs text-slate-400 mb-0.5">Precio</p>
          <p className="font-bold text-emerald-600">${player.currentPrice}</p>
        </div>
        <div className="text-center py-3">
          <p className="text-xs text-slate-400 mb-0.5">Puntos</p>
          <p className="font-bold text-red-600">{player.totalPoints}</p>
        </div>
      </div>
      {player.weeklyStats.length > 0 ? (
        <div className="px-4 py-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Historial semanal</p>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {[...player.weeklyStats]
              .sort((a, b) => b.year - a.year || b.week - a.week)
              .map((stat) => (
                <div key={`${stat.year}-${stat.week}`} className="flex justify-between text-xs py-1 border-b border-slate-50">
                  <span className="text-slate-400">Semana {stat.week} / {stat.year}</span>
                  <span className="font-medium text-slate-700">{stat.points} pts</span>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="px-4 py-4 text-xs text-slate-400 text-center">Sin historial semanal</div>
      )}
      {isTransferOpen && (
        <div className="px-4 py-3 border-t border-slate-100">
          <button
            onClick={() => setConfirmModal(true)}
            disabled={selling}
            className="w-full bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50"
          >
            {selling ? "Vendiendo..." : `Vender por $${player.currentPrice}`}
          </button>
        </div>
      )}
    </div>
  )
}

function PlayerList({ players, onSelect }: { players: TeamPlayer[]; onSelect: (p: Player) => void }) {
  const sorted = [...players].sort(
    (a, b) => POSITION_ORDER.indexOf(a.player.position) - POSITION_ORDER.indexOf(b.player.position)
  )
  return (
    <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Tu equipo</p>
        <p className="text-xs text-slate-400 mt-0.5">Clic en un jugador para ver su ficha</p>
      </div>
      <div className="divide-y divide-slate-50 max-h-[480px] overflow-y-auto">
        {sorted.map(({ player }) => (
          <button
            key={player.id}
            onClick={() => onSelect(player)}
            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 text-left transition-colors"
          >
            <div>
              <p className="text-xs font-medium text-slate-800">{player.name}</p>
              <p className="text-xs text-slate-400">{player.position}</p>
            </div>
            <div className="text-right shrink-0 ml-2">
              <p className="text-xs font-medium text-emerald-600">${player.currentPrice}</p>
              <p className="text-xs text-red-500">{player.totalPoints} pts</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function TeamPage() {
  const router = useRouter()
  const [data, setData] = useState<TeamStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"list" | "pitch">("pitch")
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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

  const handleEmptySlotClick = (position: string) => {
    router.push("/draft?position=" + encodeURIComponent(position))
  }

  const handlePitchPlayerClick = (pitchPlayer: { id: number }) => {
    const found = team.players.find((tp) => tp.player.id === pitchPlayer.id)
    if (found) {
      setSelectedPlayer((prev) => (prev?.id === found.player.id ? null : found.player))
    }
  }

  const handleSell = async (playerId: number) => {
    const res = await fetch("/api/team/sell", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId }),
    })
    if (res.ok) {
      setSelectedPlayer(null)
      // Reload team data
      const updated = await fetch("/api/team/stats").then((r) => r.json())
      setData(updated)
    } else {
      const err = await res.json()
      setErrorMessage(err.error || "Error al vender jugador")
    }
  }

  return (
    <div className="w-full bg-gray-50 flex-1">
      <Modal
        isOpen={!!errorMessage}
        title="Error"
        message={errorMessage ?? ""}
        onCancel={() => setErrorMessage(null)}
      />
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-light text-slate-900 tracking-wide truncate">{team.name}</h1>
              {isLocked && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded border border-red-200 uppercase tracking-widest font-medium shrink-0">Mercado Cerrado</span>
              )}
              <Link href="/draft" className="text-sm border border-slate-300 rounded px-2 py-1 text-slate-500 hover:text-slate-900 hover:border-slate-800 transition-colors shrink-0">
                {isLocked ? "Ver precios" : "Mercado"}
              </Link>
            </div>
            <div className="flex gap-4 mt-2 flex-wrap">
              <p className="text-red-600 text-base font-medium">{totalPoints} <span className="text-xs font-light tracking-widest text-slate-500">PUNTOS</span></p>
              <p className="text-emerald-600 text-base font-medium">${portfolioValue} <span className="text-xs font-light uppercase tracking-widest text-slate-500">VALOR</span></p>
              <p className="text-slate-800 text-base font-medium">${user?.balance || 0} <span className="text-xs font-light uppercase tracking-widest text-slate-500">DISPONIBLE</span></p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm w-fit self-start sm:self-auto shrink-0">
            <button
              onClick={() => setView("pitch")}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm transition-colors ${view === "pitch" ? "bg-slate-900 text-white font-light" : "text-slate-500 hover:text-slate-800"}`}
            >
              <FaRegImage />
              Cancha
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm transition-colors ${view === "list" ? "bg-slate-900 text-white font-light" : "text-slate-500 hover:text-slate-800"}`}
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
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Pitch */}
              <div className="flex-1 w-full">
                <RugbyPitch
                  players={team.players.map((tp) => ({
                    id: tp.player.id,
                    name: tp.player.name,
                    position: tp.player.position,
                    currentPrice: tp.player.currentPrice,
                  }))}
                  onPlayerClick={handlePitchPlayerClick}
                  onEmptySlotClick={!isLocked ? handleEmptySlotClick : undefined}
                  selectedPlayerId={selectedPlayer?.id}
                />
              </div>

              {/* Desktop sidebar */}
              <div className="hidden lg:block w-64 shrink-0">
                {selectedPlayer ? (
                  <PlayerFicha player={selectedPlayer} onClose={() => setSelectedPlayer(null)} isTransferOpen={!isLocked} onSell={handleSell} />
                ) : (
                  <PlayerList players={team.players} onSelect={setSelectedPlayer} />
                )}
              </div>

              {/* Mobile: ficha below pitch when selected */}
              {selectedPlayer && (
                <div className="lg:hidden w-full">
                  <PlayerFicha player={selectedPlayer} onClose={() => setSelectedPlayer(null)} isTransferOpen={!isLocked} onSell={handleSell} />
                </div>
              )}
            </div>
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

        {weeks.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Historial semanal</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
              <table className="text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">Jugador</th>
                    {weeks.map((w) => (
                      <th key={`${w.year}-${w.week}`} className="px-3 py-3 font-semibold text-center whitespace-nowrap">
                        S{w.week}/{w.year}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {team.players.map((tp) => (
                    <tr key={tp.player.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium whitespace-nowrap">{tp.player.name}</td>
                      {weeks.map((w) => {
                        const stat = tp.player.weeklyStats.find(
                          (ws) => ws.week === w.week && ws.year === w.year
                        )
                        return (
                          <td key={`${w.year}-${w.week}`} className="px-3 py-2 text-center text-gray-600">
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
