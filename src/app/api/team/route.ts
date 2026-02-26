import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

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

  if (!playerIds || playerIds.length !== 15) {
    return NextResponse.json(
      { error: "Debés seleccionar exactamente 15 jugadores" },
      { status: 400 }
    )
  }

  // Upsert por si el webhook de Clerk no llegó todavía
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId },
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
