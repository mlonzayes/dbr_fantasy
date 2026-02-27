import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { clerkClient } from "@clerk/nextjs/server"
import { FaTrophy, FaMedal, FaArrowRight, FaCalendarAlt } from "react-icons/fa"

async function getNextMatch() {
  return prisma.match.findFirst({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" },
  })
}

async function getRanking() {
  const teams = await prisma.team.findMany({
    include: {
      players: {
        include: { player: { select: { totalPoints: true } } },
      },
    },
  })

  const userIds = teams.map((t: any) => t.userId)
  if (userIds.length === 0) return []

  const clerk = await clerkClient()
  const usersResponse = await clerk.users.getUserList({ userId: userIds })
  const userMap = Object.fromEntries(
    usersResponse.data.map((u) => [
      u.id,
      [u.firstName, u.lastName].filter(Boolean).join(" ") ||
      u.emailAddresses[0]?.emailAddress ||
      "Usuario",
    ])
  )

  return teams
    .map((team: any) => ({
      teamName: team.name,
      ownerName: userMap[team.userId] ?? "Usuario",
      totalPoints: team.players.reduce((sum: any, tp: any) => sum + tp.player.totalPoints, 0),
      userId: team.userId,
    }))
    .sort((a: any, b: any) => b.totalPoints - a.totalPoints)
    .slice(0, 10)
    .map((team: any, index: any) => ({ ...team, position: index + 1 }))
}

export default async function HomePage() {
  const { userId } = await auth()
  const [ranking, nextMatch] = await Promise.all([getRanking(), getNextMatch()])

  let userTeam = null
  let userPosition = null

  if (userId) {
    userTeam = await prisma.team.findUnique({
      where: { userId },
      include: {
        players: { include: { player: { select: { totalPoints: true } } } },
      },
    })

    if (userTeam) {
      const allTeams = await prisma.team.findMany({
        include: { players: { include: { player: { select: { totalPoints: true } } } } },
      })
      const sorted = allTeams
        .map((t: any) => ({
          userId: t.userId,
          pts: t.players.reduce((s: any, tp: any) => s + tp.player.totalPoints, 0),
        }))
        .sort((a: any, b: any) => b.pts - a.pts)
      userPosition = sorted.findIndex((t: any) => t.userId === userId) + 1
    }
  }

  const userTotalPoints = userTeam
    ? userTeam.players.reduce((sum: any, tp: any) => sum + tp.player.totalPoints, 0)
    : 0

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="text-center mb-10 sm:mb-16">
        <h1 className="text-3xl sm:text-4xl font-light text-slate-900 tracking-wide flex flex-col items-center justify-center gap-1">
          Rugby Fantasy
          <span className="text-red-600 font-semibold text-xl sm:text-2xl tracking-normal">Don Bosco Rugby</span>
        </h1>
        <p className="text-slate-500 mt-4 text-sm font-light">Armá tu equipo, seguí los puntos, ganá el ranking.</p>
      </div>

      {userId && !userTeam && (
        <div className="bg-white border border-slate-200 rounded p-10 mb-12 text-center shadow-sm relative overflow-hidden">
          <div className="absolute -top-4 -right-4 p-4 text-slate-100"><FaTrophy size={120} /></div>
          <p className="text-lg font-light text-slate-800 mb-6 relative z-10">Aún no tenés un equipo armado.</p>
          <Link
            href="/draft"
            className="inline-flex items-center gap-2 bg-slate-950 text-white px-8 py-2.5 rounded text-sm font-light hover:bg-slate-800 transition-colors relative z-10"
          >
            Armar Equipo
          </Link>
        </div>
      )}

      {userId && userTeam && userPosition && (
        <div className="bg-white border border-slate-200 rounded p-6 mb-12 flex items-center justify-between shadow-sm">
          <div>
            <p className="font-medium text-slate-900 text-base">
              {userTeam.name}
            </p>
            <p className="text-sm font-light text-slate-500 mt-1">{userTotalPoints} <span className="text-red-600">pts</span></p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-light text-slate-900 flex items-center justify-end gap-2">
              #{userPosition} <FaMedal className="text-slate-300 text-lg" />
            </p>
          </div>
        </div>
      )}

      {nextMatch && (() => {
        const fmt = new Intl.DateTimeFormat("es-AR", {
          timeZone: "America/Argentina/Buenos_Aires",
          weekday: "long", day: "numeric", month: "long",
          hour: "2-digit", minute: "2-digit",
        })
        return (
          <div className="bg-white border border-slate-200 rounded shadow-sm mb-12 overflow-hidden">
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <FaCalendarAlt className="text-red-500 text-xs" />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Próximo partido</p>
            </div>
            <div className="px-6 py-5">
              <p className="text-xs text-slate-400 mb-3 text-center uppercase tracking-widest">{nextMatch.round}</p>
              <div className="flex items-center justify-center gap-4">
                <span className="font-bold text-slate-900 text-lg text-right flex-1">{nextMatch.homeTeam}</span>
                <span className="text-slate-300 font-light text-sm shrink-0">vs</span>
                <span className="font-bold text-slate-900 text-lg text-left flex-1">{nextMatch.awayTeam}</span>
              </div>
              <div className="text-center mt-3 space-y-0.5">
                <p className="text-sm text-slate-600 capitalize">{fmt.format(new Date(nextMatch.date))}</p>
                <p className="text-xs text-slate-400">{nextMatch.stadium}</p>
              </div>
            </div>
          </div>
        )
      })()}

      <h2 className="text-lg font-light text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-2">Top 10</h2>

      {ranking.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          Todavia no hay equipos.
        </p>
      ) : (
        <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-light text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 text-left font-light w-16">#</th>
                  <th className="px-6 py-4 text-left font-light">Equipo</th>
                  <th className="px-6 py-4 text-left font-light">Dueño</th>
                  <th className="px-6 py-4 text-right font-light">Pts</th>
                </tr>
              </thead>
              <tbody className="font-light">
                {ranking.map((entry: any) => (
                  <tr
                    key={entry.userId}
                    className={`border-b border-slate-50 last:border-0 transition-colors ${entry.userId === userId ? "bg-slate-50 font-normal text-slate-900" : "hover:bg-slate-50 text-slate-600"
                      }`}
                  >
                    <td className="px-6 py-4 text-slate-400">
                      {entry.position === 1
                        ? "1"
                        : entry.position === 2
                          ? "2"
                          : entry.position === 3
                            ? "3"
                            : entry.position}
                    </td>
                    <td className="px-6 py-4 text-slate-800">{entry.teamName}</td>
                    <td className="px-6 py-4 text-slate-500">{entry.ownerName}</td>
                    <td className="px-6 py-4 text-right text-red-600">
                      {entry.totalPoints}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {ranking.length > 0 && (
        <div className="text-center mt-8">
          <Link href="/ranking" className="inline-flex items-center gap-2 text-slate-500 text-xs hover:text-slate-900 transition-colors uppercase tracking-widest">
            Ver ranking completo <FaArrowRight />
          </Link>
        </div>
      )}
    </div>
  )
}
