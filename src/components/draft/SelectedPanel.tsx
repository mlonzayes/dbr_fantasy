"use client"

interface Player {
  id: number
  name: string
  position: string
}

interface SelectedPanelProps {
  selected: Player[]
  teamName: string
  onTeamNameChange: (name: string) => void
  onConfirm: () => void
  loading: boolean
}

export default function SelectedPanel({
  selected,
  teamName,
  onTeamNameChange,
  onConfirm,
  loading,
}: SelectedPanelProps) {
  const remaining = 15 - selected.length

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-4">
      <h2 className="font-bold text-lg text-gray-800 mb-1">Mi equipo</h2>
      <p
        className={`text-sm font-medium mb-3 ${
          remaining === 0 ? "text-green-600" : "text-orange-500"
        }`}
      >
        {selected.length}/15 jugadores seleccionados
        {remaining > 0 && ` (faltan ${remaining})`}
      </p>

      <input
        type="text"
        placeholder="Nombre del equipo"
        value={teamName}
        onChange={(e) => onTeamNameChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      <ul className="space-y-1 mb-4 max-h-64 overflow-y-auto">
        {selected.map((p) => (
          <li key={p.id} className="text-sm flex justify-between">
            <span className="font-medium truncate">{p.name}</span>
            <span className="text-gray-400 text-xs ml-2 shrink-0">{p.position}</span>
          </li>
        ))}
        {selected.length === 0 && (
          <li className="text-sm text-gray-400 italic">Ningún jugador seleccionado</li>
        )}
      </ul>

      <button
        onClick={onConfirm}
        disabled={selected.length !== 15 || !teamName.trim() || loading}
        className="w-full bg-green-700 text-white py-2 rounded-lg font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-800 transition-colors"
      >
        {loading ? "Guardando..." : "Confirmar equipo"}
      </button>
    </div>
  )
}
