"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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

export default function DraftPage() {
  const router = useRouter()
  const [players, setPlayers] = useState<Player[]>([])
  const [selected, setSelected] = useState<Player[]>([])
  const [positionFilter, setPositionFilter] = useState("Todos")
  const [teamName, setTeamName] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetchingTeam, setFetchingTeam] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    // Check if user already has a team
    fetch("/api/team")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.id) {
          router.replace("/team")
        } else {
          setFetchingTeam(false)
        }
      })
      .catch(() => setFetchingTeam(false))
  }, [router])

  useEffect(() => {
    fetch("/api/players")
      .then((r) => r.json())
      .then(setPlayers)
  }, [])

  const filtered =
    positionFilter === "Todos"
      ? players
      : players.filter((p) => p.position === positionFilter)

  const togglePlayer = (player: Player) => {
    if (selected.find((p) => p.id === player.id)) {
      setSelected(selected.filter((p) => p.id !== player.id))
    } else {
      if (selected.length >= 15) return
      setSelected([...selected, player])
    }
  }

  const handleConfirm = async () => {
    if (selected.length !== 15 || !teamName.trim()) return
    setLoading(true)
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
      setLoading(false)
    }
  }

  if (fetchingTeam) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

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
          {/* Left: player list */}
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
                />
              ))}
            </div>
          </div>

          {/* Right: selected panel */}
          <div className="w-full lg:w-72 shrink-0">
            <SelectedPanel
              selected={selected}
              teamName={teamName}
              onTeamNameChange={setTeamName}
              onConfirm={handleConfirm}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
