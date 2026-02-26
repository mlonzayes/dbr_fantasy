import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { isTransferWindowOpen } from "@/lib/transferWindow"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const team = await prisma.team.findUnique({
    where: { userId },
    include: { players: { include: { player: true } } },
  })

  return NextResponse.json(team)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const existing = await prisma.team.findUnique({ where: { userId } })
  if (existing) return NextResponse.json({ error: "Ya tenés un equipo" }, { status: 400 })

  const { name, playerIds } = await req.json()

  if (!isTransferWindowOpen()) {
    return NextResponse.json({ error: "El mercado se encuentra cerrado hasta las 19:00hs." }, { status: 403 })
  }

  if (!playerIds || playerIds.length !== 15) {
    return NextResponse.json(
      { error: "Debés seleccionar exactamente 15 jugadores" },
      { status: 400 }
    )
  }

  // Calculate team cost
  const selectedPlayers = await prisma.player.findMany({
    where: { id: { in: playerIds } }
  })

  const totalCost = selectedPlayers.reduce((acc: number, p: { currentPrice: number }) => acc + p.currentPrice, 0)

  // Upsert por si el webhook de Clerk no llegó todavía
  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId },
  })

  // Validate budget
  // Note: For Draft (first team), it's strictly User Balance vs TotalCost. 
  // For Team Update (Transfers), it's User Balance + Old Team Value vs TotalCost. 
  // Since this block is currently handling the creation:
  if (user.balance < totalCost) {
    return NextResponse.json({ error: "Fondos insuficientes para este equipo." }, { status: 400 })
  }

  const newBalance = user.balance - totalCost

  await prisma.user.update({
    where: { id: userId },
    data: { balance: newBalance }
  })

  const team = await prisma.team.create({
    data: {
      name,
      userId,
      players: {
        create: playerIds.map((id: number) => ({ playerId: id })),
      },
    },
    include: { players: { include: { player: true } } },
  })

  return NextResponse.json(team)
}
