import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkIsAdmin } from "@/lib/isAdmin"

export async function GET() {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

    const config = await prisma.appConfig.findUnique({ where: { id: 1 } })
    return NextResponse.json({ marketOpen: config?.marketOpen ?? false })
}

export async function POST(req: Request) {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

    const { open } = await req.json()
    if (typeof open !== "boolean") {
        return NextResponse.json({ error: "El campo 'open' debe ser booleano" }, { status: 400 })
    }

    const config = await prisma.appConfig.upsert({
        where: { id: 1 },
        update: { marketOpen: open },
        create: { id: 1, marketOpen: open },
    })

    return NextResponse.json({ marketOpen: config.marketOpen })
}
