"use client"

interface Player {
  id: number
  name: string
  position: string
  totalPoints: number
}

interface PlayerCardProps {
  player: Player
  selected: boolean
  onToggle: (player: Player) => void
}

export default function PlayerCard({ player, selected, onToggle }: PlayerCardProps) {
  return (
    <button
      onClick={() => onToggle(player)}
      className={`w-full text-left rounded-lg border-2 p-3 transition-all ${
        selected
          ? "border-green-600 bg-green-50 text-green-900"
          : "border-gray-200 bg-white hover:border-green-300 hover:bg-green-50"
      }`}
    >
      <p className="font-semibold text-sm leading-tight">{player.name}</p>
      <p className="text-xs text-gray-500 mt-0.5">{player.position}</p>
      <p className="text-xs font-medium text-green-700 mt-1">{player.totalPoints} pts</p>
    </button>
  )
}
