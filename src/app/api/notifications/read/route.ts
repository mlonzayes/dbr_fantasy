import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const allNotifications = await prisma.notification.findMany({ select: { id: true } })

  await prisma.notificationRead.createMany({
    data: allNotifications.map((n) => ({ userId, notificationId: n.id })),
    skipDuplicates: true,
  })

  return NextResponse.json({ ok: true })
}
