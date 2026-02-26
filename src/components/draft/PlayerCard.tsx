"use client"

interface Player {
  id: number
  name: string
  position: string
  totalPoints: number
  currentPrice: number
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
      className={`w-full text-left rounded-lg border p-3 flex flex-col justify-between h-full transition-all ${selected
        ? "border-slate-800 bg-slate-900 text-white shadow-md"
        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
        }`}
    >
      <div>
        <p className={`font-medium text-sm leading-tight ${selected ? "text-slate-100" : "text-slate-900"}`}>
          {player.name}
        </p>
        <p className={`text-xs mt-0.5 ${selected ? "text-slate-400" : "text-slate-500"}`}>
          {player.position}
        </p>
      </div>
      <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-200/50">
        <p className="text-xs font-semibold text-emerald-600">
          ${player.currentPrice}
        </p>
        <p className={`text-[10px] font-medium ${selected ? "text-slate-300" : "text-slate-400"}`}>
          ★ {player.totalPoints} pts
        </p>
      </div>
    </button>
  )
}
