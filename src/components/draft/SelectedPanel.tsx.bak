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

const FORWARDS = [
  { position: "Pilar", max: 2 },
  { position: "Hooker", max: 1 },
  { position: "Segunda línea", max: 2 },
  { position: "Ala", max: 2 },
  { position: "N°8", max: 1 },
]

const BACKS = [
  { position: "Medio scrum", max: 1 },
  { position: "Apertura", max: 1 },
  { position: "Centro", max: 2 },
  { position: "Wing", max: 2 },
  { position: "Full", max: 1 },
]

function PositionRow({ position, max, filled }: { position: string; max: number; filled: number }) {
  const complete = filled === max
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
      <span className={`text-xs ${complete ? "text-slate-700 font-medium" : "text-slate-400"}`}>
        {position}
      </span>
      <div className="flex items-center gap-1">
        {Array.from({ length: max }).map((_, i) => (
          <span
            key={i}
            className={`inline-block w-2.5 h-2.5 rounded-full border ${
              i < filled
                ? "bg-emerald-500 border-emerald-500"
                : "bg-transparent border-slate-300"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default function SelectedPanel({
  selected,
  teamName,
  onTeamNameChange,
  onConfirm,
  loading,
}: SelectedPanelProps) {
  const totalCost = selected.reduce((acc, p) => acc + p.currentPrice, 0)
  const budgetLeft = BUDGET_MAX - totalCost
  const overBudget = budgetLeft < 0

  const countFor = (pos: string) => selected.filter((p) => p.position === pos).length
  const allComplete = [...FORWARDS, ...BACKS].every(({ position, max }) => countFor(position) === max)

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-4 shadow-sm flex flex-col gap-4">
      <div>
        <h2 className="font-light text-xl text-slate-900">Tu Selección</h2>
        <div className="flex justify-between items-center text-sm font-medium mt-2">
          <span className={allComplete ? "text-emerald-600" : "text-slate-500"}>
            {selected.length}/15 Jugadores
          </span>
          <span className={overBudget ? "text-red-500 font-bold" : "text-slate-600"}>
            ${budgetLeft} disp.
          </span>
        </div>
      </div>

      {/* Position slots */}
      <div>
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Delanteros</p>
        {FORWARDS.map(({ position, max }) => (
          <PositionRow key={position} position={position} max={max} filled={countFor(position)} />
        ))}
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1 mt-3">Backs</p>
        {BACKS.map(({ position, max }) => (
          <PositionRow key={position} position={position} max={max} filled={countFor(position)} />
        ))}
      </div>

      <input
        type="text"
        placeholder="Nombre del equipo"
        value={teamName}
        onChange={(e) => onTeamNameChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
      />

      {overBudget && (
        <p className="text-xs text-red-500 font-medium -mt-2">Superaste el tope salarial ($1.250).</p>
      )}

      <button
        onClick={onConfirm}
        disabled={!allComplete || !teamName.trim() || loading || overBudget}
        className="w-full bg-slate-900 text-white py-2 rounded font-light text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
      >
        {loading ? "Guardando..." : "Confirmar equipo"}
      </button>
    </div>
  )
}
