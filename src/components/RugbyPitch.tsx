"use client"

interface PitchPlayer {
    id: number
    name: string
    position: string
    currentPrice: number
}

interface RugbyPitchProps {
    players: PitchPlayer[]
    onPlayerClick?: (player: PitchPlayer) => void
    onEmptySlotClick?: (position: string) => void
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

// Jersey silhouette: sleeves + body, straight top edge between collar points
const JERSEY_PATH = "M15,2 L0,14 L0,26 L10,24 L10,50 L38,50 L38,24 L48,26 L48,14 L33,2 Z"

function JerseyIcon({ uid, selected }: { uid: string; selected?: boolean }) {
    const clipId = `jc-${uid}`
    return (
        <svg
            viewBox="0 0 48 52"
            className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-md"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <clipPath id={clipId}>
                    <path d={JERSEY_PATH} />
                </clipPath>
            </defs>

            {/* Jersey body — stripes clipped to jersey shape */}
            <g clipPath={`url(#${clipId})`}>
                {selected ? (
                    <rect width="48" height="52" fill="#FACC15" />
                ) : (
                    <>
                        {/* Navy base */}
                        <rect width="48" height="52" fill="#1B2E5A" />
                        {/* Thin red/white stripes */}
                        <rect y="13" width="48" height="3" fill="#CC2200" />
                        <rect y="16" width="48" height="3" fill="#ffffff" />
                        <rect y="21" width="48" height="3" fill="#CC2200" />
                        <rect y="24" width="48" height="3" fill="#ffffff" />
                        <rect y="29" width="48" height="3" fill="#CC2200" />
                        <rect y="32" width="48" height="3" fill="#ffffff" />
                        <rect y="37" width="48" height="3" fill="#CC2200" />
                        <rect y="40" width="48" height="3" fill="#ffffff" />
                        <rect y="45" width="48" height="3" fill="#CC2200" />
                    </>
                )}
            </g>

            {/* V-neck collar triangle — drawn on top of stripes */}
            <path
                d="M15,2 L33,2 L24,15 Z"
                fill={selected ? "#FEF08A" : "white"}
                clipPath={`url(#${clipId})`}
            />
        </svg>
    )
}

export default function RugbyPitch({ players, onPlayerClick, onEmptySlotClick, selectedPlayerId }: RugbyPitchProps) {
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

            {/* Rugby Goal Posts - Top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-10">
                <div className="absolute bottom-0 left-1/2 -translate-x-px w-[2px] h-3 bg-yellow-300/95" />
                <div className="absolute bottom-3 left-0 right-0 h-[2px] bg-yellow-300/95" />
                <div className="absolute top-0 bottom-3 left-0 w-[2px] bg-yellow-300/95" />
                <div className="absolute top-0 bottom-3 right-0 w-[2px] bg-yellow-300/95" />
            </div>

            {/* Rugby Goal Posts - Bottom */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-10">
                <div className="absolute top-0 left-1/2 -translate-x-px w-[2px] h-3 bg-yellow-300/95" />
                <div className="absolute top-3 left-0 right-0 h-[2px] bg-yellow-300/95" />
                <div className="absolute top-3 bottom-0 left-0 w-[2px] bg-yellow-300/95" />
                <div className="absolute top-3 bottom-0 right-0 w-[2px] bg-yellow-300/95" />
            </div>

            {/* Players */}
            <div className="relative z-10 w-full h-full flex flex-col justify-between py-3 sm:py-8 px-1 sm:px-3">
                {rowsConfig.map((row, rowIdx) => {
                    const rowPlayers = getPlayersByPositions(players, row.positions)
                    return (
                        <div key={row.name} className="flex justify-evenly items-center w-full">
                            {rowPlayers.map((player, idx) => (
                                <div
                                    key={idx}
                                    className="flex flex-col items-center w-[54px] sm:w-20"
                                    onClick={() => player && onPlayerClick?.(player)}
                                >
                                    {player ? (
                                        <div className={`flex flex-col items-center cursor-pointer transition-transform duration-150 ${selectedPlayerId === player.id ? "scale-110" : "hover:scale-105"}`}>
                                            <div className="relative">
                                                <JerseyIcon uid={`${player.id}`} selected={selectedPlayerId === player.id} />
                                                <div className="absolute inset-0 flex items-center justify-center pt-4">
                                                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-800 bg-white/90 px-1 rounded leading-tight">
                                                        ${player.currentPrice}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={`mt-1 px-1 py-0.5 rounded shadow-sm text-center transition-colors duration-150 ${selectedPlayerId === player.id ? "bg-yellow-300" : "bg-white/95"}`}>
                                                <p className="text-[9px] sm:text-[11px] font-bold text-slate-800 truncate w-[50px] sm:w-[72px]">
                                                    {player.name.split(" ").slice(-1)[0].toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className={`flex flex-col items-center opacity-50 transition-opacity duration-150 ${onEmptySlotClick ? "cursor-pointer hover:opacity-80" : ""}`}
                                            onClick={() => onEmptySlotClick?.(row.positions[idx])}
                                        >
                                            <JerseyIcon uid={`empty-${rowIdx}-${idx}`} />
                                            <div className="mt-1 bg-white/60 px-1 py-0.5 rounded text-center">
                                                <p className="text-[9px] sm:text-[11px] font-medium text-slate-600 truncate w-[50px] sm:w-[72px]">
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
