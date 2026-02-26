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
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            selected === pos
              ? "bg-green-700 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {pos}
        </button>
      ))}
    </div>
  )
}
