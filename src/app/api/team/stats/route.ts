import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { isTransferWindowOpen } from "@/lib/transferWindow"

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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { balance: true }
  })

  // Return structure matching TeamStatsResponse in the UI
  return NextResponse.json({
    team,
    user: user ? { balance: user.balance } : null,
    isLocked: !isTransferWindowOpen()
  })
}
