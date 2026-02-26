import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { clerkClient } from "@clerk/nextjs/server"

export async function GET() {
  const teams = await prisma.team.findMany({
    include: {
      players: {
        include: { player: { select: { totalPoints: true } } },
      },
    },
  })

  // Obtener nombres desde Clerk
  const userIds = teams.map((t: { userId: string }) => t.userId)
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

  const ranking = teams
    .map((team: any) => ({
      teamName: team.name,
      ownerName: userMap[team.userId] ?? "Usuario",
      totalPoints: team.players.reduce((sum: number, tp: { player: { totalPoints: number } }) => sum + tp.player.totalPoints, 0),
      userId: team.userId,
    }))
    .sort((a: any, b: any) => b.totalPoints - a.totalPoints)
    .map((team: any, index: number) => ({ ...team, position: index + 1 }))

  return NextResponse.json(ranking)
}
