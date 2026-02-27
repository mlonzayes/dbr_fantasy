"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import PlayerCard from "@/components/draft/PlayerCard"
import PositionFilter from "@/components/draft/PositionFilter"
import SelectedPanel from "@/components/draft/SelectedPanel"
import Modal from "@/components/Modal"

interface Player {
  id: number
  name: string
  position: string
  totalPoints: number
  currentPrice: number
}

const POSITION_MAX: Record<string, number> = {
  "Pilar": 2, "Hooker": 1, "Segunda línea": 2, "Ala": 2, "N°8": 1,
  "Medio scrum": 1, "Apertura": 1, "Centro": 2, "Wing": 2, "Full": 1,
}

function MarketPlayerCard({
  player,
  canBuy,
  positionFull,
  isLocked,
  onBuy,
}: {
  player: Player
  canBuy: boolean
  positionFull: boolean
  isLocked: boolean
  onBuy: (p: Player) => void
}) {
  const disabled = isLocked || positionFull || !canBuy
  const label = isLocked
    ? "Mercado cerrado"
    : positionFull
    ? "Posición completa"
    : !canBuy
    ? "Sin saldo"
    : `Comprar $${player.currentPrice}`

  return (
    <div className="bg-white rounded border border-slate-200 shadow-sm p-4 flex flex-col gap-2">
      <div>
        <p className="font-semibold text-slate-800 text-sm leading-tight">{player.name}</p>
        <p className="text-xs text-slate-500">{player.position}</p>
      </div>
      <div className="flex justify-between text-xs mt-1">
        <span className="font-medium text-emerald-600">${player.currentPrice}</span>
        <span className="text-red-500">{player.totalPoints} pts</span>
      </div>
      <button
        onClick={() => onBuy(player)}
        disabled={disabled}
        className="mt-1 w-full bg-slate-900 text-white text-xs py-1.5 rounded font-medium hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {label}
      </button>
    </div>
  )
}

export default function DraftPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p className="text-gray-500">Cargando...</p></div>}>
      <DraftPageInner />
    </Suspense>
  )
}

function DraftPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<"loading" | "create" | "market">("loading")

  // Market mode state
  const [marketBalance, setMarketBalance] = useState(0)
  const [teamPlayerIds, setTeamPlayerIds] = useState<Set<number>>(new Set())
  const [teamPositions, setTeamPositions] = useState<string[]>([])
  const [isLocked, setIsLocked] = useState(false)
  const [confirmBuy, setConfirmBuy] = useState<Player | null>(null)
  const [buying, setBuying] = useState(false)

  // Shared state
  const [players, setPlayers] = useState<Player[]>([])
  const [positionFilter, setPositionFilter] = useState(searchParams.get("position") ?? "Todos")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Create mode state
  const [selected, setSelected] = useState<Player[]>([])
  const [teamName, setTeamName] = useState("")
  const [createLoading, setCreateLoading] = useState(false)

  useEffect(() => {
    fetch("/api/team/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data.team) {
          setMode("market")
          setMarketBalance(data.user?.balance ?? 0)
          setTeamPlayerIds(new Set(data.team.players.map((tp: { player: Player }) => tp.player.id)))
          setTeamPositions(data.team.players.map((tp: { player: Player }) => tp.player.position))
          setIsLocked(data.isLocked)
        } else {
          setMode("create")
        }
      })
      .catch(() => setMode("create"))

    fetch("/api/players")
      .then((r) => r.json())
      .then(setPlayers)
  }, [])

  // Position limits for create mode
  const isSlotFull = (player: Player) => {
    if (selected.find((p) => p.id === player.id)) return false
    const max = POSITION_MAX[player.position] ?? 0
    const current = selected.filter((p) => p.position === player.position).length
    return current >= max
  }

  // Create mode handlers
  const togglePlayer = (player: Player) => {
    if (selected.find((p) => p.id === player.id)) {
      setSelected(selected.filter((p) => p.id !== player.id))
    } else {
      if (isSlotFull(player)) return
      setSelected([...selected, player])
    }
  }

  const handleConfirm = async () => {
    if (selected.length !== 15 || !teamName.trim()) return
    setCreateLoading(true)
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: teamName.trim(), playerIds: selected.map((p) => p.id) }),
      })
      const data = await res.json()
      if (res.ok) {
        router.push("/team")
      } else {
        setErrorMessage(data.error || "Error al crear el equipo")
      }
    } finally {
      setCreateLoading(false)
    }
  }

  // Market mode handlers
  const handleBuyConfirm = async () => {
    if (!confirmBuy) return
    setBuying(true)
    try {
      const res = await fetch("/api/team/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: confirmBuy.id }),
      })
      const data = await res.json()
      if (res.ok) {
        setConfirmBuy(null)
        router.push("/team")
      } else {
        setConfirmBuy(null)
        setErrorMessage(data.error || "Error al comprar jugador")
      }
    } finally {
      setBuying(false)
    }
  }

  if (mode === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  // ── Market mode ──────────────────────────────────────────────────────────────
  if (mode === "market") {
    const available = players.filter((p) => !teamPlayerIds.has(p.id))
    const filtered =
      positionFilter === "Todos" ? available : available.filter((p) => p.position === positionFilter)

    const isPositionFull = (player: Player) => {
      const max = POSITION_MAX[player.position] ?? 0
      const current = teamPositions.filter((pos) => pos === player.position).length
      return current >= max
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
          title="Confirmar compra"
          message={`¿Comprar a ${confirmBuy?.name} por $${confirmBuy?.currentPrice}?`}
          onCancel={() => setConfirmBuy(null)}
          onConfirm={handleBuyConfirm}
          confirmLabel={buying ? "Comprando..." : "Comprar"}
        />

        <div className="max-w-7xl mx-auto px-4 py-8 w-full">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mercado de Pases</h1>
              <p className="text-gray-500 text-sm mt-1">
                Saldo disponible:{" "}
                <span className="font-semibold text-emerald-600">${marketBalance}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isLocked && (
                <span className="bg-red-100 text-red-800 text-xs px-3 py-1 rounded border border-red-200 uppercase tracking-widest font-medium">
                  Mercado Cerrado
                </span>
              )}
              <Link
                href="/team"
                className="text-sm border border-slate-300 rounded px-3 py-1.5 text-slate-500 hover:text-slate-900 hover:border-slate-800 transition-colors"
              >
                ← Volver al equipo
              </Link>
            </div>
          </div>

          {isLocked && (
            <div className="mb-4 bg-orange-50 text-orange-800 border-orange-200 border p-3 rounded text-sm">
              El mercado de pases se encuentra cerrado los sábados de 10:00 a 19:00 hs. Podés ver los precios pero no comprar.
            </div>
          )}

          <div className="mb-4">
            <PositionFilter selected={positionFilter} onSelect={setPositionFilter} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filtered.map((player) => (
              <MarketPlayerCard
                key={player.id}
                player={player}
                canBuy={marketBalance >= player.currentPrice}
                positionFull={isPositionFull(player)}
                isLocked={isLocked}
                onBuy={setConfirmBuy}
              />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 text-sm">
                No hay jugadores disponibles para esta posición.
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Create mode (original draft flow) ────────────────────────────────────────
  const filtered =
    positionFilter === "Todos" ? players : players.filter((p) => p.position === positionFilter)

  return (
    <div className="w-full bg-gray-50 flex-1">
      <Modal
        isOpen={!!errorMessage}
        title="Error"
        message={errorMessage ?? ""}
        onCancel={() => setErrorMessage(null)}
      />
      <div className="max-w-7xl mx-auto px-4 py-8 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Draft — Armá tu equipo</h1>
        <p className="text-gray-500 text-sm mb-6">
          Seleccioná exactamente 15 jugadores para tu equipo.
        </p>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="mb-4">
              <PositionFilter selected={positionFilter} onSelect={setPositionFilter} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filtered.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  selected={!!selected.find((p) => p.id === player.id)}
                  onToggle={togglePlayer}
                  disabled={isSlotFull(player)}
                />
              ))}
            </div>
          </div>
          <div className="w-full lg:w-72 shrink-0">
            <SelectedPanel
              selected={selected}
              teamName={teamName}
              onTeamNameChange={setTeamName}
              onConfirm={handleConfirm}
              loading={createLoading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
