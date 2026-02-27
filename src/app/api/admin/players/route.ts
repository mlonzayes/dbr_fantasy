import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkIsAdmin } from "@/lib/isAdmin"

export async function POST(req: Request) {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

    try {
        const { name, position, price, division } = await req.json()

        if (!name || !position || !price) {
            return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 })
        }

        const numericPrice = Number(price)

        const player = await prisma.player.create({
            data: {
                name: name.trim(),
                position: position.trim(),
                division: division?.trim() || null,
                totalPoints: 0,
                basePrice: numericPrice,
                currentPrice: numericPrice,
            },
        })

        return NextResponse.json({ player })
    } catch (error) {
        console.error("Error creando jugador:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}
