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

  // Delete related records first to avoid FK constraint errors
  await prisma.weeklyStat.deleteMany({ where: { playerId } })
  await prisma.teamPlayer.deleteMany({ where: { playerId } })
  await prisma.player.delete({ where: { id: playerId } })

  return NextResponse.json({ ok: true, refundedUsers: player.teamPlayers.length })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const { id } = await params
  const playerId = Number(id)
  if (isNaN(playerId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

  try {
    const { priceChange } = await req.json()

    if (priceChange === undefined || typeof priceChange !== "number") {
      return NextResponse.json({ error: "Se requiere un valor numérico en 'priceChange'" }, { status: 400 })
    }

    const player = await prisma.player.findUnique({ where: { id: playerId } })
    if (!player) return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 })

    const updated = await prisma.player.update({
      where: { id: playerId },
      data: {
        currentPrice: { increment: priceChange },
      },
    })

    return NextResponse.json({ player: updated })
  } catch (error) {
    console.error("Error actualizando precio:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
