import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkIsAdmin } from "@/lib/isAdmin"

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const { id } = await params
  const playerId = Number(id)
  if (isNaN(playerId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: { teamPlayers: { include: { team: { include: { user: true } } } } },
  })
  if (!player) return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 })

  // Refund all users who have this player in their team
  for (const tp of player.teamPlayers) {
    await prisma.user.update({
      where: { id: tp.team.userId },
      data: { balance: { increment: player.currentPrice } },
    })
  }

  await prisma.player.delete({ where: { id: playerId } })

  return NextResponse.json({ ok: true, refundedUsers: player.teamPlayers.length })
}
