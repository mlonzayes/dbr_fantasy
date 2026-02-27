import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkIsAdmin } from "@/lib/isAdmin"

export async function GET() {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  })
  return NextResponse.json(notifications)
}

export async function POST(req: Request) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const { title, message } = await req.json()
  if (!title || !message) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
  }

  const notification = await prisma.notification.create({
    data: { title, message },
  })
  return NextResponse.json({ notification })
}
