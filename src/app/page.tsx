import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { clerkClient } from "@clerk/nextjs/server"
import Navbar from "@/components/Navbar"

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
  const ranking = await getRanking()

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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Rugby Fantasy</h1>
          <p className="text-gray-500">Armá tu equipo, seguí los puntos, ganá el ranking.</p>
        </div>

        {userId && !userTeam && (
          <div className="bg-green-700 text-white rounded-xl p-6 mb-8 text-center">
            <p className="text-lg font-semibold mb-3">Todavía no tenés equipo!</p>
            <Link
              href="/draft"
              className="bg-white text-green-800 px-6 py-2 rounded-lg font-bold hover:bg-green-50 transition-colors"
            >
              Armar mi equipo
            </Link>
          </div>
        )}

        {userId && userTeam && userPosition && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-8 flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-900">{userTeam.name}</p>
              <p className="text-sm text-green-700">{userTotalPoints} puntos</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-800">#{userPosition}</p>
              <p className="text-xs text-gray-500">tu posicion</p>
            </div>
          </div>
        )}

        <h2 className="text-xl font-bold text-gray-800 mb-4">Top 10</h2>

        {ranking.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Todavia no hay equipos.
          </p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-green-700 text-white">
                  <th className="px-4 py-3 text-center font-semibold w-12">#</th>
                  <th className="px-4 py-3 text-left font-semibold">Equipo</th>
                  <th className="px-4 py-3 text-left font-semibold">Dueno</th>
                  <th className="px-4 py-3 text-right font-semibold">Puntos</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((entry: any) => (
                  <tr
                    key={entry.userId}
                    className={`border-t border-gray-100 ${entry.userId === userId ? "bg-green-50 font-semibold" : "hover:bg-gray-50"
                      }`}
                  >
                    <td className="px-4 py-3 text-center text-gray-500">
                      {entry.position === 1
                        ? "1"
                        : entry.position === 2
                          ? "2"
                          : entry.position === 3
                            ? "3"
                            : entry.position}
                    </td>
                    <td className="px-4 py-3">{entry.teamName}</td>
                    <td className="px-4 py-3 text-gray-600">{entry.ownerName}</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-700">
                      {entry.totalPoints}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {ranking.length > 0 && (
          <div className="text-center mt-4">
            <Link href="/ranking" className="text-green-700 text-sm hover:underline font-medium">
              Ver ranking completo
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
