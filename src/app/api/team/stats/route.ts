import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const team = await prisma.team.findUnique({
    where: { userId },
    include: {
      players: {
        include: {
          player: {
            include: {
              weeklyStats: { orderBy: [{ year: "asc" }, { week: "asc" }] },
            },
          },
        },
      },
    },
  })

  return NextResponse.json(team)
}
