import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkIsAdmin } from "@/lib/isAdmin"

export async function POST(req: Request) {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

    try {
        const { name } = await req.json()
        if (!name?.trim()) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 })

        const coach = await prisma.coach.create({ data: { name: name.trim() } })
        return NextResponse.json({ coach })
    } catch (error) {
        console.error("Error creando entrenador:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

    const { id } = await req.json()
    await prisma.coach.delete({ where: { id: Number(id) } })
    return NextResponse.json({ ok: true })
}
