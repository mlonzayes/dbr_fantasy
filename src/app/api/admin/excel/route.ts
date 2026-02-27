import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkIsAdmin } from "@/lib/isAdmin"
import * as XLSX from "xlsx"

// GET /api/admin/excel — descarga template con todos los jugadores
export async function GET() {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const players = await prisma.player.findMany({
    orderBy: [{ division: "asc" }, { position: "asc" }, { name: "asc" }],
  })

  const rows = players.map((p) => ({
    id: p.id,
    nombre: p.name,
    posicion: p.position,
    division: p.division ?? "",
    semana: "",
    año: new Date().getFullYear(),
    puntos: "",
  }))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows, {
    header: ["id", "nombre", "posicion", "division", "semana", "año", "puntos"],
  })

  // Ancho de columnas
  ws["!cols"] = [
    { wch: 6 },  // id
    { wch: 28 }, // nombre
    { wch: 16 }, // posicion
    { wch: 14 }, // division
    { wch: 10 }, // semana
    { wch: 8 },  // año
    { wch: 10 }, // puntos
  ]

  XLSX.utils.book_append_sheet(wb, ws, "Jugadores")
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="jugadores_semana.xlsx"`,
    },
  })
}

// POST /api/admin/excel — importa puntos y/o división desde xlsx
export async function POST(req: Request) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const wb = XLSX.read(buffer, { type: "buffer" })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<{
      id: number
      nombre?: string
      posicion?: string
      division?: string
      semana?: number | string
      año?: number | string
      puntos?: number | string
    }>(ws)

    if (rows.length === 0) {
      return NextResponse.json({ error: "El archivo está vacío" }, { status: 400 })
    }

    const errors: string[] = []
    let processedStats = 0
    let processedDivisions = 0

    // Semana/año desde la primera fila con datos (si se completó)
    const firstWithStat = rows.find((r) => r.semana !== "" && r.semana != null && r.puntos !== "" && r.puntos != null)
    const globalWeek = firstWithStat ? Number(firstWithStat.semana) : null
    const globalYear = firstWithStat ? Number(firstWithStat.año) : null

    for (const row of rows) {
      const id = Number(row.id)
      if (!id || isNaN(id)) {
        errors.push(`Fila sin ID válido: ${JSON.stringify(row)}`)
        continue
      }

      // Actualizar división si se completó
      if (row.division !== undefined && row.division !== "") {
        try {
          await prisma.player.update({
            where: { id },
            data: { division: String(row.division).trim() },
          })
          processedDivisions++
        } catch {
          errors.push(`ID ${id}: no se pudo actualizar división`)
        }
      }

      // Registrar puntos si se completaron semana y puntos
      const week = row.semana !== "" && row.semana != null ? Number(row.semana) : null
      const year = row.año !== "" && row.año != null ? Number(row.año) : null
      const points = row.puntos !== "" && row.puntos != null ? Number(row.puntos) : null

      if (week != null && year != null && points != null && !isNaN(week) && !isNaN(year) && !isNaN(points)) {
        try {
          await prisma.weeklyStat.upsert({
            where: { playerId_week_year: { playerId: id, week, year } },
            create: { playerId: id, week, year, points },
            update: { points },
          })
          processedStats++
        } catch {
          errors.push(`ID ${id}: no se pudo guardar stat semana ${week}/${year}`)
        }
      }
    }

    // Recalcular totalPoints de los jugadores procesados
    if (processedStats > 0 && globalWeek != null && globalYear != null) {
      const playerIds = rows
        .filter((r) => r.puntos !== "" && r.puntos != null)
        .map((r) => Number(r.id))
        .filter((id) => !isNaN(id))

      for (const id of playerIds) {
        const agg = await prisma.weeklyStat.aggregate({
          where: { playerId: id },
          _sum: { points: true },
        })
        await prisma.player.update({
          where: { id },
          data: { totalPoints: agg._sum.points ?? 0 },
        })
      }
    }

    return NextResponse.json({
      processedStats,
      processedDivisions,
      errors,
      week: globalWeek,
      year: globalYear,
    })
  } catch (error) {
    console.error("Error procesando Excel:", error)
    return NextResponse.json({ error: "Error procesando el archivo" }, { status: 500 })
  }
}
