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

  const team = await prisma.team.findUnique({
    where: { userId },
    include: { players: { select: { playerId: true } } },
  })
  if (!team) return NextResponse.json({ error: "No tenés equipo" }, { status: 404 })

  const alreadyInTeam = team.players.some((tp) => tp.playerId === playerId)
  if (alreadyInTeam) return NextResponse.json({ error: "Ya tenés ese jugador en el equipo" }, { status: 400 })

  const player = await prisma.player.findUnique({ where: { id: playerId } })
  if (!player) return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

  if (user.balance < player.currentPrice) {
    return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 })
  }

  await prisma.$transaction([
    prisma.teamPlayer.create({ data: { teamId: team.id, playerId } }),
    prisma.user.update({ where: { id: userId }, data: { balance: { decrement: player.currentPrice } } }),
  ])

  return NextResponse.json({ ok: true, newBalance: user.balance - player.currentPrice })
}
