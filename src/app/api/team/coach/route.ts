import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const { coachId } = await req.json()

    const team = await prisma.team.findUnique({ where: { userId } })
    if (!team) return NextResponse.json({ error: "No tenés equipo" }, { status: 404 })

    if (coachId !== null && coachId !== undefined) {
        const coach = await prisma.coach.findUnique({ where: { id: Number(coachId) } })
        if (!coach) return NextResponse.json({ error: "Entrenador no encontrado" }, { status: 404 })
    }

    const updated = await prisma.team.update({
        where: { userId },
        data: { coachId: coachId ? Number(coachId) : null },
        include: { coach: true },
    })

    return NextResponse.json({ coach: updated.coach })
}
