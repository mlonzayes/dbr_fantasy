"use client"

interface Player {
  id: number
  name: string
  position: string
  currentPrice: number
}

interface SelectedPanelProps {
  selected: Player[]
  teamName: string
  onTeamNameChange: (name: string) => void
  onConfirm: () => void
  loading: boolean
}

const BUDGET_MAX = 1250

export default function SelectedPanel({
  selected,
  teamName,
  onTeamNameChange,
  onConfirm,
  loading,
}: SelectedPanelProps) {
  const remaining = 15 - selected.length
  const totalCost = selected.reduce((acc, player) => acc + player.currentPrice, 0)
  const budgetLeft = BUDGET_MAX - totalCost
  const overBudget = budgetLeft < 0

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-4 shadow-sm flex flex-col gap-4">
      <div>
        <h2 className="font-light text-xl text-slate-900 mb-1">Tu Selección</h2>
        <div className="flex justify-between items-center text-sm font-medium mt-2">
          <span className={remaining === 0 ? "text-emerald-600" : "text-slate-500"}>
            {selected.length}/15 Jugadores
          </span>
          <span className={overBudget ? "text-red-500 font-bold" : "text-slate-600"}>
            Presupuesto: ${budgetLeft}
          </span>
        </div>
      </div>

      <input
        type="text"
        placeholder="Nombre del equipo"
        value={teamName}
        onChange={(e) => onTeamNameChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      <ul className="space-y-2 mb-2 max-h-64 overflow-y-auto pr-2">
        {selected.map((p) => (
          <li key={p.id} className="text-sm flex justify-between items-center bg-slate-50 px-3 py-2 rounded border border-slate-100">
            <div className="flex flex-col">
              <span className="font-medium text-slate-800 truncate">{p.name}</span>
              <span className="text-slate-400 text-xs">{p.position}</span>
            </div>
            <span className="text-emerald-600 font-semibold text-xs ml-2 shrink-0">${p.currentPrice}</span>
          </li>
        ))}
        {selected.length === 0 && (
          <li className="text-sm text-slate-400 italic">Ningún jugador seleccionado</li>
        )}
      </ul>

      {overBudget && (
        <p className="text-xs text-red-500 font-medium mb-2">Has superado el tope salarial.</p>
      )}

      <button
        onClick={onConfirm}
        disabled={selected.length !== 15 || !teamName.trim() || loading || overBudget}
        className="w-full bg-slate-900 text-white py-2 rounded font-light text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
      >
        {loading ? "Guardando..." : "Confirmar equipo"}
      </button>
    </div>
  )
}
