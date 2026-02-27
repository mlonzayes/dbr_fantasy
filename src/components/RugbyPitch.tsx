"use client"

import { FaTshirt } from "react-icons/fa"

interface PitchPlayer {
    id: number
    name: string
    position: string
    currentPrice: number
}

interface RugbyPitchProps {
    players: PitchPlayer[]
    onPlayerClick?: (player: PitchPlayer) => void
    selectedPlayerId?: number
}

function getPlayersByPositions(players: PitchPlayer[], positions: string[]) {
    const result: (PitchPlayer | null)[] = []
    const available = [...players]
    positions.forEach((pos) => {
        const idx = available.findIndex((p) => p.position === pos)
        if (idx !== -1) {
            result.push(available[idx])
            available.splice(idx, 1)
        } else {
            result.push(null)
        }
    })
    return result
}

export default function RugbyPitch({ players, onPlayerClick, selectedPlayerId }: RugbyPitchProps) {
    const rowsConfig = [
        { name: "Primera Línea", positions: ["Pilar", "Hooker", "Pilar"] },
        { name: "Segunda Línea", positions: ["Segunda línea", "Segunda línea"] },
        { name: "Tercera Línea", positions: ["Ala", "N°8", "Ala"] },
        { name: "Medios", positions: ["Medio scrum", "Apertura"] },
        { name: "Centros", positions: ["Centro", "Centro"] },
        { name: "Fondo", positions: ["Wing", "Full", "Wing"] },
    ]

    return (
        <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] max-w-2xl mx-auto rounded-lg overflow-hidden border-4 border-slate-50 shadow-lg bg-[#2e7d32]">
            {/* Grass stripes */}
            <div className="absolute inset-0 flex flex-col">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className={`flex-1 w-full ${i % 2 === 0 ? "bg-white/5" : "bg-transparent"}`} />
                ))}
            </div>

            {/* In-goal areas */}
            <div className="absolute top-0 left-0 right-0 h-[9%] bg-black/15" />
            <div className="absolute bottom-0 left-0 right-0 h-[9%] bg-black/15" />

            {/* Try lines */}
            <div className="absolute top-[9%] w-full h-[2px] bg-white/80" />
            <div className="absolute bottom-[9%] w-full h-[2px] bg-white/80" />

            {/* 22m lines */}
            <div className="absolute top-[31%] w-full h-[2px] bg-white/40" />
            <div className="absolute bottom-[31%] w-full h-[2px] bg-white/40" />

            {/* 10m lines */}
            <div className="absolute top-[43%] w-full h-[1px] bg-white/25" />
            <div className="absolute bottom-[43%] w-full h-[1px] bg-white/25" />

            {/* Halfway line */}
            <div className="absolute top-1/2 w-full h-[3px] bg-white/60" />

            {/* Rugby Goal Posts - Top (H shape, base goes down into in-goal) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-10">
                {/* base support */}
                <div className="absolute bottom-0 left-1/2 -translate-x-px w-[2px] h-3 bg-yellow-300/95" />
                {/* crossbar */}
                <div className="absolute bottom-3 left-0 right-0 h-[2px] bg-yellow-300/95" />
                {/* left upright */}
                <div className="absolute top-0 bottom-3 left-0 w-[2px] bg-yellow-300/95" />
                {/* right upright */}
                <div className="absolute top-0 bottom-3 right-0 w-[2px] bg-yellow-300/95" />
            </div>

            {/* Rugby Goal Posts - Bottom (H shape, base goes up into in-goal) */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-10">
                {/* base support */}
                <div className="absolute top-0 left-1/2 -translate-x-px w-[2px] h-3 bg-yellow-300/95" />
                {/* crossbar */}
                <div className="absolute top-3 left-0 right-0 h-[2px] bg-yellow-300/95" />
                {/* left upright */}
                <div className="absolute top-3 bottom-0 left-0 w-[2px] bg-yellow-300/95" />
                {/* right upright */}
                <div className="absolute top-3 bottom-0 right-0 w-[2px] bg-yellow-300/95" />
            </div>

            {/* Players */}
            <div className="relative z-10 w-full h-full flex flex-col justify-between py-4 sm:py-8 px-2">
                {rowsConfig.map((row) => {
                    const rowPlayers = getPlayersByPositions(players, row.positions)
                    return (
                        <div key={row.name} className="flex justify-center items-center gap-2 sm:gap-6 w-full">
                            {rowPlayers.map((player, idx) => (
                                <div
                                    key={idx}
                                    className="flex flex-col items-center w-20 sm:w-24"
                                    onClick={() => player && onPlayerClick?.(player)}
                                >
                                    {player ? (
                                        <div className={`flex flex-col items-center cursor-pointer transition-transform duration-150 ${selectedPlayerId === player.id ? "scale-110" : "hover:scale-105"}`}>
                                            <div className={`relative drop-shadow-md transition-colors duration-150 ${selectedPlayerId === player.id ? "text-yellow-400" : "text-blue-700"}`}>
                                                <FaTshirt className="text-4xl sm:text-5xl" />
                                                <div className="absolute inset-0 flex items-center justify-center pt-1 text-[10px] sm:text-xs font-bold text-white">
                                                    ${player.currentPrice}
                                                </div>
                                            </div>
                                            <div className={`mt-1 px-2 py-0.5 rounded shadow-sm text-center transition-colors duration-150 ${selectedPlayerId === player.id ? "bg-yellow-300" : "bg-white/95"}`}>
                                                <p className="text-[10px] sm:text-xs font-bold text-slate-800 truncate w-16 sm:w-20">
                                                    {player.name.split(" ").slice(-1)[0].toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center opacity-50">
                                            <FaTshirt className="text-4xl sm:text-5xl text-slate-400" />
                                            <div className="mt-1 bg-white/50 px-2 py-0.5 rounded text-center">
                                                <p className="text-[10px] sm:text-xs font-medium text-slate-500 truncate w-16 sm:w-20">
                                                    {row.positions[idx]}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
