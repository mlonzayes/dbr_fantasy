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

    const rawRows = XLSX.utils.sheet_to_json(sheet) as Array<Record<string, unknown>>
    const rows = rawRows.map(r => {
        const normalized: Record<string, unknown> = {}
        for (const key of Object.keys(r)) {
            normalized[key.toLowerCase().trim()] = r[key]
        }
        return normalized as { id: number; pricechange: number }
    })

    let processed = 0
    const errors: string[] = []

    for (const row of rows) {
        if (!row.id || row.pricechange === undefined) {
            errors.push(`Fila inválida (faltan datos): ${JSON.stringify(row)}`)
            continue
        }

        const playerId = Number(row.id)
        if (isNaN(playerId)) {
            errors.push(`ID no numérico: ${row.id}`)
            continue
        }

        const priceChange = Number(row.pricechange)
        if (isNaN(priceChange)) {
            errors.push(`Valor no numérico para ID ${playerId}: ${row.pricechange}`)
            continue
        }

        try {
            const player = await prisma.player.findUnique({
                where: { id: playerId },
            })

            if (!player) {
                errors.push(`Jugador con ID ${playerId} no encontrado`)
                continue
            }

            await prisma.player.update({
                where: { id: playerId },
                data: {
                    currentPrice: { increment: priceChange },
                },
            })

            processed++
        } catch (e) {
            errors.push(`Error actualizando ID ${playerId}: ${e}`)
        }
    }

    return NextResponse.json({ processed, errors })
}
