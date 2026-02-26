import React from "react"
import { FaTshirt } from "react-icons/fa"

interface PitchPlayer {
    id: number
    name: string
    position: string
    currentPrice: number
}

interface RugbyPitchProps {
    players: PitchPlayer[]
}

const POSITION_ORDER = [
    "Pilar",
    "Hooker",
    "Pilar",
    "Segunda línea",
    "Segunda línea",
    "Ala",
    "N°8",
    "Ala",
    "Medio scrum",
    "Apertura",
    "Centro",
    "Centro",
    "Wing",
    "Full",
    "Wing",
]

function getPlayersByPositions(players: PitchPlayer[], positions: string[]) {
    const result: (PitchPlayer | null)[] = []
    const availablePlayers = [...players]

    positions.forEach((pos) => {
        const minIndex = availablePlayers.findIndex((p) => p.position === pos)
        if (minIndex !== -1) {
            result.push(availablePlayers[minIndex])
            availablePlayers.splice(minIndex, 1)
        } else {
            result.push(null)
        }
    })

    return result
}

export default function RugbyPitch({ players }: RugbyPitchProps) {
    // Configured rows starting from Forwards (top) to Backs (bottom)
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
            {/* Background Grass Pattern (simple stripes) */}
            <div className="absolute inset-0 flex flex-col">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div
                        key={i}
                        className={`flex-1 w-full ${i % 2 === 0 ? "bg-white/5" : "bg-transparent"}`}
                    />
                ))}
            </div>

            {/* Field Lines */}
            {/* 22m, 50m lines */}
            <div className="absolute top-[22%] w-full h-[2px] bg-white/40" />
            <div className="absolute top-1/2 w-full h-[3px] bg-white/60" />
            <div className="absolute bottom-[22%] w-full h-[2px] bg-white/40" />
            {/* Center circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-white/60" />
            {/* Goal Posts */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-8 border-b-2 border-l-2 border-r-2 border-white/80" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-8 border-t-2 border-l-2 border-r-2 border-white/80" />

            {/* Players container */}
            <div className="relative z-10 w-full h-full flex flex-col justify-between py-4 sm:py-8 px-2">
                {rowsConfig.map((row, rowIndex) => {
                    const rowPlayers = getPlayersByPositions(players, row.positions)

                    return (
                        <div key={row.name} className="flex justify-center items-center gap-2 sm:gap-6 w-full">
                            {rowPlayers.map((player, idx) => (
                                <div key={idx} className="flex flex-col items-center w-20 sm:w-24">
                                    {player ? (
                                        <div className="flex flex-col items-center group cursor-pointer">
                                            <div className="relative text-blue-700 drop-shadow-md group-hover:scale-110 transition-transform">
                                                <FaTshirt className="text-4xl sm:text-5xl" />
                                                <div className="absolute inset-0 flex items-center justify-center pt-1 text-[10px] sm:text-xs font-bold text-white">
                                                    ${player.currentPrice}
                                                </div>
                                            </div>
                                            <div className="mt-1 bg-white/95 px-2 py-0.5 rounded shadow-sm text-center">
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
