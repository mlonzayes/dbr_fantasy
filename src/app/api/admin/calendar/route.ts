import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkIsAdmin } from "@/lib/isAdmin"

export async function POST(req: Request) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const { round, homeTeam, awayTeam, stadium, date } = await req.json()
  if (!round || !homeTeam || !awayTeam || !stadium || !date) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
  }

  const match = await prisma.match.create({
    data: { round, homeTeam, awayTeam, stadium, date: new Date(date) },
  })
  return NextResponse.json({ match })
}
