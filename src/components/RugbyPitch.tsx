"use client"

import Image from "next/image"
import { FaUser } from "react-icons/fa"

interface PitchPlayer {
    id: number
    name: string
    position: string
    currentPrice: number
    imageUrl?: string | null
}

interface Coach {
    id: number
    name: string
    imageUrl?: string | null
}

interface RugbyPitchProps {
    players: PitchPlayer[]
    onPlayerClick?: (player: PitchPlayer) => void
    onEmptySlotClick?: (position: string) => void
    selectedPlayerId?: number
    coach?: Coach | null
    onCoachClick?: () => void
    onEmptyCoachClick?: () => void
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

function FieldSVG() {
    return (
        <svg viewBox="0 0 70 120" className="w-full h-auto block" xmlns="http://www.w3.org/2000/svg">
            {/* Base verde */}
            <rect width="70" height="120" fill="#2d6b1a" />
            {/* Franjas de césped alternadas */}
            {Array.from({ length: 10 }).map((_, i) =>
                i % 2 === 0 ? null : (
                    <rect key={i} x="0" y={i * 12} width="70" height="12" fill="#306e1c" />
                )
            )}
            {/* Zonas de anotación */}
            <rect x="0" y="0" width="70" height="10" fill="#265f14" />
            <rect x="0" y="110" width="70" height="10" fill="#265f14" />

            {/* Líneas de banda (touch lines) */}
            <line x1="1" y1="0" x2="1" y2="120" stroke="white" strokeWidth="0.7" />
            <line x1="69" y1="0" x2="69" y2="120" stroke="white" strokeWidth="0.7" />

            {/* Líneas de balón muerto */}
            <line x1="0" y1="0.3" x2="70" y2="0.3" stroke="white" strokeWidth="0.7" />
            <line x1="0" y1="119.7" x2="70" y2="119.7" stroke="white" strokeWidth="0.7" />

            {/* Try lines */}
            <line x1="1" y1="10" x2="69" y2="10" stroke="white" strokeWidth="0.7" />
            <line x1="1" y1="110" x2="69" y2="110" stroke="white" strokeWidth="0.7" />

            {/* 22m lines */}
            <line x1="1" y1="32" x2="69" y2="32" stroke="white" strokeWidth="0.5" />
            <line x1="1" y1="88" x2="69" y2="88" stroke="white" strokeWidth="0.5" />

            {/* 10m lines (punteadas) */}
            <line x1="1" y1="20" x2="69" y2="20" stroke="white" strokeWidth="0.3" strokeDasharray="2 2" opacity="0.6" />
            <line x1="1" y1="100" x2="69" y2="100" stroke="white" strokeWidth="0.3" strokeDasharray="2 2" opacity="0.6" />

            {/* Línea del medio */}
            <line x1="1" y1="60" x2="69" y2="60" stroke="white" strokeWidth="0.5" />
            <circle cx="35" cy="60" r="0.7" fill="white" />

            {/* Líneas de 5m (verticales punteadas) */}
            <line x1="6" y1="10" x2="6" y2="110" stroke="white" strokeWidth="0.25" strokeDasharray="1 3" opacity="0.5" />
            <line x1="64" y1="10" x2="64" y2="110" stroke="white" strokeWidth="0.25" strokeDasharray="1 3" opacity="0.5" />

            {/* Líneas de 15m (verticales punteadas) */}
            <line x1="16" y1="10" x2="16" y2="110" stroke="white" strokeWidth="0.25" strokeDasharray="1 3" opacity="0.5" />
            <line x1="54" y1="10" x2="54" y2="110" stroke="white" strokeWidth="0.25" strokeDasharray="1 3" opacity="0.5" />


            {/* Etiquetas de líneas */}
            <text x="2.5" y="30.5" fill="white" fontSize="2.4" fontFamily="Arial, sans-serif" fontWeight="bold" opacity="0.85">22</text>
            <text x="62" y="30.5" fill="white" fontSize="2.4" fontFamily="Arial, sans-serif" fontWeight="bold" opacity="0.85">22</text>
            <text x="2.5" y="86.5" fill="white" fontSize="2.4" fontFamily="Arial, sans-serif" fontWeight="bold" opacity="0.85">22</text>
            <text x="62" y="86.5" fill="white" fontSize="2.4" fontFamily="Arial, sans-serif" fontWeight="bold" opacity="0.85">22</text>
            <text x="2.5" y="58.5" fill="white" fontSize="2.4" fontFamily="Arial, sans-serif" fontWeight="bold" opacity="0.85">50</text>
            <text x="62" y="58.5" fill="white" fontSize="2.4" fontFamily="Arial, sans-serif" fontWeight="bold" opacity="0.85">50</text>
        </svg>
    )
}

function PlayerChip({
    player,
    selected,
    onClick,
}: {
    player: PitchPlayer
    selected: boolean
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center transition-transform duration-150 ${selected ? "scale-110" : "hover:scale-105"}`}
        >
            {/* Foto circular */}
            <div className={`relative w-11 h-11 rounded-full overflow-hidden border-2 shadow-md ${selected ? "border-yellow-400 ring-2 ring-yellow-300/60" : "border-white"}`}>
                {player.imageUrl ? (
                    <Image src={player.imageUrl} alt={player.name} width={44} height={44} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-[#1B2E5A] flex items-center justify-center">
                        <FaUser className="text-white text-sm" />
                    </div>
                )}
                {/* Badge de precio */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-center">
                    <span className="text-[7px] font-bold text-white leading-tight">${player.currentPrice}</span>
                </div>
            </div>
            {/* Nombre + posición */}
            <div className={`mt-0.5 rounded shadow-sm text-center w-[62px] ${selected ? "bg-yellow-300" : "bg-white/95"}`}>
                <p className="text-[9px] font-bold text-slate-800 truncate px-0.5 leading-tight">
                    {player.name.split(" ").slice(-1)[0].toUpperCase()}
                </p>
                <p className={`text-[7px] truncate px-0.5 leading-tight ${selected ? "text-yellow-800" : "text-slate-500"}`}>
                    {player.position}
                </p>
            </div>
        </button>
    )
}

function EmptySlot({
    position,
    onClick,
}: {
    position: string
    onClick?: () => void
}) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center transition-opacity ${onClick ? "cursor-pointer opacity-70 hover:opacity-100" : "cursor-default opacity-40"}`}
        >
            <div className="w-11 h-11 rounded-full bg-white/10 border-2 border-white/50 border-dashed flex items-center justify-center shadow">
                <span className="text-white/80 text-lg font-bold leading-none">+</span>
            </div>
            <div className="mt-0.5 bg-white/60 rounded text-center w-[62px]">
                <p className="text-[8px] font-medium text-slate-700 truncate px-0.5 leading-tight">{position}</p>
            </div>
        </button>
    )
}

export default function RugbyPitch({
    players,
    onPlayerClick,
    onEmptySlotClick,
    selectedPlayerId,
    coach,
    onCoachClick,
    onEmptyCoachClick,
}: RugbyPitchProps) {
    const rowsConfig = [
        { name: "Primera Línea", positions: ["Pilar", "Hooker", "Pilar"] },
        { name: "Segunda Línea", positions: ["Segunda línea", "Segunda línea"] },
        { name: "Tercera Línea", positions: ["Ala", "N°8", "Ala"] },
        { name: "Medios", positions: ["Medio scrum", "Apertura"] },
        { name: "Centros", positions: ["Centro", "Centro"] },
        { name: "Fondo", positions: ["Wing", "Full", "Wing"] },
    ]

    return (
        <div className="relative w-full rounded-xl overflow-hidden shadow-2xl">
            <FieldSVG />

            <div className="absolute inset-0 flex flex-col justify-between pt-[22%] pb-[20%] px-2">
                {rowsConfig.map((row, rowIdx) => {
                    const rowPlayers = getPlayersByPositions(players, row.positions)
                    return (
                        <div key={row.name} className="flex justify-evenly items-center w-full">
                            {rowPlayers.map((player, idx) => (
                                <div key={idx} className="flex justify-center">
                                    {player ? (
                                        <PlayerChip
                                            player={player}
                                            selected={selectedPlayerId === player.id}
                                            onClick={() => onPlayerClick?.(player)}
                                        />
                                    ) : (
                                        <EmptySlot
                                            position={row.positions[idx]}
                                            onClick={onEmptySlotClick ? () => onEmptySlotClick(row.positions[idx]) : undefined}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                })}

                {/* Entrenador */}
                <div className="flex justify-center">
                    {coach ? (
                        <button
                            onClick={onCoachClick}
                            className="flex items-center gap-1.5 bg-white/90 hover:bg-yellow-50 border border-white/60 hover:border-yellow-300 rounded-lg px-2 py-1 shadow transition-all"
                        >
                            {coach.imageUrl ? (
                                <Image src={coach.imageUrl} alt={coach.name} width={24} height={24} className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                                <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-[9px] font-bold">DT</span>
                            )}
                            <div>
                                <p className="text-[7px] font-semibold text-slate-400 uppercase tracking-widest leading-none">DT</p>
                                <p className="text-[9px] font-bold text-slate-800 leading-tight">
                                    {coach.name.split(" ").slice(-1)[0].toUpperCase()}
                                </p>
                            </div>
                        </button>
                    ) : (
                        <button
                            onClick={onEmptyCoachClick}
                            className={`flex items-center gap-1.5 bg-white/60 border border-white/40 rounded-lg px-2 py-1 transition-all ${onEmptyCoachClick ? "cursor-pointer hover:bg-white/80 opacity-80" : "opacity-40 cursor-default"}`}
                        >
                            <span className="w-6 h-6 rounded-full bg-slate-300/60 flex items-center justify-center text-slate-500 text-xs font-bold">+</span>
                            <div>
                                <p className="text-[7px] font-semibold text-slate-400 uppercase tracking-widest leading-none">DT</p>
                                <p className="text-[9px] font-medium text-slate-500 leading-tight">Sin asignar</p>
                            </div>
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
