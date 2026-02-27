import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      reads: { where: { userId } },
    },
  })

  const result = notifications.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    createdAt: n.createdAt,
    read: n.reads.length > 0,
  }))

  const unreadCount = result.filter((n) => !n.read).length

  return NextResponse.json({ notifications: result, unreadCount })
}
