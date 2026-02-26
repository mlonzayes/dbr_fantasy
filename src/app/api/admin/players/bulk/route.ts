import { NextResponse } from "next/server"
import * as XLSX from "xlsx"
import { prisma } from "@/lib/prisma"
import { checkIsAdmin } from "@/lib/isAdmin"

export async function POST(req: Request) {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 })

    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(sheet) as Array<{
        name: string
        position: string
        price: number
    }>

    let processed = 0
    const errors: string[] = []

    for (const row of rows) {
        if (!row.name || !row.position || row.price === undefined) {
            errors.push(`Fila inválida (faltan datos): ${JSON.stringify(row)}`)
            continue
        }

        try {
            const numericPrice = Number(row.price)

            await prisma.player.create({
                data: {
                    name: row.name.toString().trim(),
                    position: row.position.toString().trim(),
                    totalPoints: 0,
                    basePrice: numericPrice,
                    currentPrice: numericPrice,
                },
            })

            processed++
        } catch (e) {
            errors.push(`Error creando jugador ${row.name}: ${e}`)
        }
    }

    return NextResponse.json({ processed, errors })
}
