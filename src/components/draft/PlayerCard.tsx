"use client"

import Image from "next/image"
import { FaUser } from "react-icons/fa"

interface Player {
  id: number
  name: string
  position: string
  totalPoints: number
  currentPrice: number
  imageUrl?: string | null
}

interface PlayerCardProps {
  player: Player
  selected: boolean
  onToggle: (player: Player) => void
  disabled?: boolean
}

export default function PlayerCard({ player, selected, onToggle, disabled }: PlayerCardProps) {
  return (
    <button
      onClick={() => !disabled && onToggle(player)}
      disabled={disabled && !selected}
      className={`w-full text-left rounded-lg border p-3 flex flex-col justify-between h-full transition-all ${
        selected
          ? "border-slate-800 bg-slate-900 text-white shadow-md"
          : disabled
          ? "border-slate-100 bg-slate-50 opacity-40 cursor-not-allowed"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      {/* Foto del jugador */}
      <div className="flex items-center gap-2 mb-2">
        {player.imageUrl ? (
          <Image
            src={player.imageUrl}
            alt={player.name}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            selected ? "bg-slate-700" : "bg-slate-100"
          }`}>
            <FaUser className={`text-sm ${selected ? "text-slate-400" : "text-slate-400"}`} />
          </div>
        )}
        <div className="min-w-0">
          <p className={`font-medium text-sm leading-tight truncate ${selected ? "text-slate-100" : "text-slate-900"}`}>
            {player.name}
          </p>
          <p className={`text-xs mt-0.5 ${selected ? "text-slate-400" : "text-slate-500"}`}>
            {player.position}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-slate-200/50">
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
