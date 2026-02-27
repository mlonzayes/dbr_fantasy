"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import RugbyPitch from "@/components/RugbyPitch"
import Modal from "@/components/Modal"
import { FaList, FaRegImage, FaTimes, FaUser } from "react-icons/fa"

interface WeeklyStat {
  week: number
  year: number
  points: number
}

interface MarketPlayer {
  id: number
  name: string
  position: string
  totalPoints: number
  currentPrice: number
  imageUrl?: string | null
}

interface Player {
  id: number
  name: string
  position: string
  totalPoints: number
  currentPrice: number
  imageUrl?: string | null
  weeklyStats: WeeklyStat[]
}

interface Coach {
  id: number
  name: string
  imageUrl?: string | null
}

interface TeamPlayer {
  player: Player
}

interface Team {
  id: string
  name: string
  createdAt: string
  players: TeamPlayer[]
  coach?: Coach | null
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

function CoachPanel({ coach, coaches, onCoachChange, onClose }: {
  coach: Coach | null | undefined
  coaches: Coach[]
  onCoachChange: (coachId: number) => Promise<void>
  onClose: () => void
}) {
  const [changing, setChanging] = useState(false)

  const handleChange = async (coachId: number) => {
    setChanging(true)
    try {
      await onCoachChange(coachId)
    } finally {
      setChanging(false)
    }
  }

  return (
    <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Entrenador</p>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 transition-colors">
          <FaTimes className="text-xs" />
        </button>
      </div>
      {coach && (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          {coach.imageUrl ? (
            <Image src={coach.imageUrl} alt={coach.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <FaUser className="text-slate-400 text-sm" />
            </div>
          )}
          <div>
            <p className="font-semibold text-slate-800 text-sm">{coach.name}</p>
            <p className="text-xs text-slate-400">Entrenador actual</p>
          </div>
        </div>
      )}
      <div className="px-4 py-3">
        <p className="text-xs font-medium text-slate-500 mb-2">Cambiar entrenador:</p>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {coaches.filter((c) => c.id !== coach?.id).map((c) => (
            <button
              key={c.id}
              onClick={() => handleChange(c.id)}
              disabled={changing}
              className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-50 text-left transition-colors disabled:opacity-50"
            >
              {c.imageUrl ? (
                <Image src={c.imageUrl} alt={c.name} width={28} height={28} className="w-7 h-7 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <FaUser className="text-slate-400 text-xs" />
                </div>
              )}
              <span className="text-xs font-medium text-slate-700">{c.name}</span>
            </button>
          ))}
        </div>
      </div>
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

function BuyPanel({
  position,
  players,
  teamPlayerIds,
  balance,
  isLocked,
  onBuy,
  onClose,
}: {
  position: string
  players: MarketPlayer[]
  teamPlayerIds: Set<number>
  balance: number
  isLocked: boolean
  onBuy: (p: MarketPlayer) => void
  onClose: () => void
}) {
  const available = players.filter((p) => p.position === position && !teamPlayerIds.has(p.id))
  return (
    <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
        <div>
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Fichar jugador</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {position} · Saldo: <span className="text-emerald-600 font-medium">${balance}</span>
          </p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 transition-colors">
          <FaTimes className="text-xs" />
        </button>
      </div>
      {isLocked && (
        <div className="px-4 py-2 bg-orange-50 border-b border-orange-100 text-xs text-orange-700">
          Mercado cerrado. Podés ver precios pero no comprar.
        </div>
      )}
      <div className="divide-y divide-slate-50 max-h-[520px] overflow-y-auto">
        {available.length === 0 ? (
          <p className="px-4 py-6 text-xs text-center text-slate-400">
            No hay jugadores disponibles para esta posición.
          </p>
        ) : (
          available.map((player) => {
            const canBuy = !isLocked && balance >= player.currentPrice
            return (
              <div key={player.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50">
                <div className="flex items-center gap-2 min-w-0">
                  {player.imageUrl ? (
                    <Image src={player.imageUrl} alt={player.name} width={28} height={28} className="w-7 h-7 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <FaUser className="text-slate-400 text-xs" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{player.name}</p>
                    <p className="text-[10px] text-slate-400">{player.totalPoints} pts</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="text-xs font-medium text-emerald-600">${player.currentPrice}</span>
                  <button
                    onClick={() => onBuy(player)}
                    disabled={!canBuy}
                    className="text-xs bg-slate-900 text-white px-2.5 py-1 rounded hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Fichar
                  </button>
                </div>
              </div>
            )
          })
        )}
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
  const [showCoachPanel, setShowCoachPanel] = useState(false)
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [allPlayers, setAllPlayers] = useState<MarketPlayer[]>([])
  const [buyPosition, setBuyPosition] = useState<string | null>(null)
  const [confirmBuy, setConfirmBuy] = useState<MarketPlayer | null>(null)
  const [buying, setBuying] = useState(false)

  const loadData = () =>
    fetch("/api/team/stats")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))

  useEffect(() => {
    loadData()
    fetch("/api/coaches").then((r) => r.json()).then(setCoaches)
    fetch("/api/players").then((r) => r.json()).then(setAllPlayers).catch(() => {})
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
    setSelectedPlayer(null)
    setShowCoachPanel(false)
    setBuyPosition(position)
  }

  const handleBuyConfirm = async () => {
    if (!confirmBuy) return
    setBuying(true)
    try {
      const res = await fetch("/api/team/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: confirmBuy.id }),
      })
      const d = await res.json()
      if (res.ok) {
        setConfirmBuy(null)
        setBuyPosition(null)
        loadData()
      } else {
        setConfirmBuy(null)
        setErrorMessage(d.error || "Error al fichar jugador")
      }
    } finally {
      setBuying(false)
    }
  }

  const handlePitchPlayerClick = (pitchPlayer: { id: number }) => {
    setShowCoachPanel(false)
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
      await loadData()
    } else {
      const err = await res.json()
      setErrorMessage(err.error || "Error al vender jugador")
    }
  }

  const handleCoachChange = async (coachId: number) => {
    const res = await fetch("/api/team/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coachId }),
    })
    if (res.ok) {
      await loadData()
      setShowCoachPanel(false)
    } else {
      const err = await res.json()
      setErrorMessage(err.error || "Error al cambiar entrenador")
    }
  }

  const handleCoachSlotClick = () => {
    setSelectedPlayer(null)
    setShowCoachPanel((prev) => !prev)
  }

  return (
    <div className="w-full bg-gray-50 flex-1">
      <Modal
        isOpen={!!errorMessage}
        title="Error"
        message={errorMessage ?? ""}
        onCancel={() => setErrorMessage(null)}
      />
      <Modal
        isOpen={!!confirmBuy}
        title="Confirmar fichaje"
        message={`¿Fichar a ${confirmBuy?.name} por $${confirmBuy?.currentPrice}?`}
        onCancel={() => setConfirmBuy(null)}
        onConfirm={handleBuyConfirm}
        confirmLabel={buying ? "Fichando..." : "Fichar"}
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
              <div className="w-full max-w-xs mx-auto lg:max-w-none lg:w-[480px] xl:w-[540px] shrink-0">
                <RugbyPitch
                  players={team.players.map((tp) => ({
                    id: tp.player.id,
                    name: tp.player.name,
                    position: tp.player.position,
                    currentPrice: tp.player.currentPrice,
                    imageUrl: tp.player.imageUrl,
                  }))}
                  onPlayerClick={handlePitchPlayerClick}
                  onEmptySlotClick={!isLocked ? handleEmptySlotClick : undefined}
                  selectedPlayerId={selectedPlayer?.id}
                  coach={team.coach}
                  onCoachClick={handleCoachSlotClick}
                  onEmptyCoachClick={handleCoachSlotClick}
                />
              </div>

              {/* Panel al costado en desktop */}
              <div className="flex-1 min-w-0 w-full">
                {showCoachPanel ? (
                  <CoachPanel
                    coach={team.coach}
                    coaches={coaches}
                    onCoachChange={handleCoachChange}
                    onClose={() => setShowCoachPanel(false)}
                  />
                ) : buyPosition ? (
                  <BuyPanel
                    position={buyPosition}
                    players={allPlayers}
                    teamPlayerIds={new Set(team.players.map((tp) => tp.player.id))}
                    balance={user?.balance ?? 0}
                    isLocked={!!isLocked}
                    onBuy={setConfirmBuy}
                    onClose={() => setBuyPosition(null)}
                  />
                ) : selectedPlayer ? (
                  <PlayerFicha player={selectedPlayer} onClose={() => setSelectedPlayer(null)} isTransferOpen={!isLocked} onSell={handleSell} />
                ) : (
                  <PlayerList players={team.players} onSelect={setSelectedPlayer} />
                )}
              </div>
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
                {/* Coach row */}
                {team.coach && (
                  <tr className="border-t border-gray-200 bg-slate-50/60">
                    <td className="px-4 py-3 font-medium flex items-center gap-2">
                      {team.coach.imageUrl ? (
                        <Image src={team.coach.imageUrl} alt={team.coach.name} width={24} height={24} className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-[10px] font-bold">DT</span>
                      )}
                      {team.coach.name}
                    </td>
                    <td className="px-4 py-3 text-slate-400 italic text-xs">Entrenador</td>
                    <td className="px-4 py-3 text-right text-slate-400">—</td>
                    <td className="px-4 py-3 text-right text-slate-400">—</td>
                  </tr>
                )}
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
