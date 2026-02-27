import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { isTransferWindowOpen } from "@/lib/transferWindow"

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  if (!isTransferWindowOpen()) {
    return NextResponse.json({ error: "El mercado se encuentra cerrado." }, { status: 403 })
  }

  const { playerId } = await req.json()
  if (!playerId) return NextResponse.json({ error: "Falta playerId" }, { status: 400 })

  const team = await prisma.team.findUnique({ where: { userId } })
  if (!team) return NextResponse.json({ error: "No tenés equipo" }, { status: 404 })

  const teamPlayer = await prisma.teamPlayer.findUnique({
    where: { teamId_playerId: { teamId: team.id, playerId } },
    include: { player: true },
  })
  if (!teamPlayer) return NextResponse.json({ error: "El jugador no está en tu equipo" }, { status: 404 })

  const refundAmount = teamPlayer.player.currentPrice

  await prisma.teamPlayer.delete({
    where: { teamId_playerId: { teamId: team.id, playerId } },
  })

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { balance: { increment: refundAmount } },
  })

  return NextResponse.json({ refundedAmount: refundAmount, newBalance: updatedUser.balance })
}
