import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkIsAdmin } from "@/lib/isAdmin"

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const { id } = await params
  const matchId = Number(id)
  if (isNaN(matchId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

  await prisma.match.delete({ where: { id: matchId } })
  return NextResponse.json({ ok: true })
}
