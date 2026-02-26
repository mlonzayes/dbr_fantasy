"use client"

const POSITIONS = [
  "Todos",
  "Pilar",
  "Hooker",
  "Segunda línea",
  "Ala",
  "N°8",
  "Medio scrum",
  "Apertura",
  "Centro",
  "Wing",
  "Full",
]

interface PositionFilterProps {
  selected: string
  onSelect: (position: string) => void
}

export default function PositionFilter({ selected, onSelect }: PositionFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {POSITIONS.map((pos) => (
        <button
          key={pos}
          onClick={() => onSelect(pos)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selected === pos
              ? "bg-slate-900 text-white font-medium"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
        >
          {pos}
        </button>
      ))}
    </div>
  )
}
