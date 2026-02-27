"use client"

import { useState } from "react"
import AdminDeletePlayerButton from "./AdminDeletePlayerButton"

interface Player {
    id: number
    name: string
    position: string
    division: string | null
    currentPrice: number
    totalPoints: number
}

export default function AdminPlayerTable({ players }: { players: Player[] }) {
    const [search, setSearch] = useState("")

    const filtered = players.filter((p) => {
        const q = search.toLowerCase()
        return (
            p.name.toLowerCase().includes(q) ||
            p.position.toLowerCase().includes(q) ||
            (p.division && p.division.toLowerCase().includes(q)) ||
            p.id.toString().includes(q)
        )
    })

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-800">
                    Jugadores registrados ({filtered.length}/{players.length})
                </h2>
                <input
                    type="text"
                    placeholder="Buscar por nombre, posición, división o ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-72 px-3 py-1.5 border border-slate-200 rounded text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 focus:border-slate-300"
                />
            </div>
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-50">
                        <th className="text-left px-4 py-3 font-semibold text-gray-600">ID</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Nombre</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Posición</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600">División</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-600">Precio</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-600">Puntos</th>
                        <th className="px-4 py-3"></th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map((p) => (
                        <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-2 text-gray-400 font-mono">{p.id}</td>
                            <td className="px-4 py-2 font-medium">{p.name}</td>
                            <td className="px-4 py-2 text-gray-500">{p.position}</td>
                            <td className="px-4 py-2">
                                {p.division ? (
                                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">{p.division}</span>
                                ) : (
                                    <span className="text-gray-300 text-xs">—</span>
                                )}
                            </td>
                            <td className="px-4 py-2 text-right font-medium text-emerald-600">${p.currentPrice}</td>
                            <td className="px-4 py-2 text-right font-semibold text-green-700">{p.totalPoints}</td>
                            <td className="px-4 py-2 text-right">
                                <AdminDeletePlayerButton playerId={p.id} playerName={p.name} />
                            </td>
                        </tr>
                    ))}
                    {filtered.length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-sm">
                                No se encontraron jugadores.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
