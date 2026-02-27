import { prisma } from "@/lib/prisma"
import { FaCalendarAlt } from "react-icons/fa"

export default async function CalendarPage() {
  const matches = await prisma.match.findMany({ orderBy: { date: "asc" } })

  const fmt = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  })

  // Group by round
  const grouped: Record<string, typeof matches> = {}
  for (const m of matches) {
    if (!grouped[m.round]) grouped[m.round] = []
    grouped[m.round].push(m)
  }

  return (
    <div className="w-full bg-gray-50 flex-1">
      <div className="max-w-3xl mx-auto px-4 py-8 w-full">
        <div className="flex items-center gap-3 mb-8">
          <FaCalendarAlt className="text-2xl text-slate-700" />
          <h1 className="text-2xl font-bold text-slate-900">Calendario de Partidos</h1>
        </div>

        {matches.length === 0 ? (
          <div className="bg-white rounded border border-slate-200 p-12 text-center">
            <FaCalendarAlt className="text-4xl text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400">No hay partidos programados todavía.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([round, roundMatches]) => (
              <div key={round}>
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 pl-1">{round}</h2>
                <div className="space-y-3">
                  {roundMatches.map((m) => (
                    <div key={m.id} className="bg-white rounded-lg border border-slate-200 shadow-sm px-6 py-4">
                      <div className="flex items-center justify-center gap-4 mb-3">
                        <span className="text-base font-semibold text-slate-800 text-right flex-1">{m.homeTeam}</span>
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">VS</span>
                        <span className="text-base font-semibold text-slate-800 text-left flex-1">{m.awayTeam}</span>
                      </div>
                      <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                        <span className="capitalize">{fmt.format(new Date(m.date))}</span>
                        <span className="text-slate-300">·</span>
                        <span>{m.stadium}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
