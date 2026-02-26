import { NextResponse } from "next/server"
import * as XLSX from "xlsx"
import { prisma } from "@/lib/prisma"
import { checkIsAdmin } from "@/lib/isAdmin"

function getWeekNumber(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1)
  const diff = date.getTime() - start.getTime()
  return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000))
}

export async function POST(req: Request) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const formData = await req.formData()
  const file = formData.get("file") as File
  const weekOverride = formData.get("week")

  if (!file) return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 })

  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet) as Array<{
    player_id: number
    points: number
  }>

  const now = new Date()
  const week = weekOverride ? Number(weekOverride) : getWeekNumber(now)
  const year = now.getFullYear()

  let processed = 0
  const errors: string[] = []

  for (const row of rows) {
    if (!row.player_id || row.points === undefined) {
      errors.push(`Fila inválida: ${JSON.stringify(row)}`)
      continue
    }

    try {
      const playerId = Number(row.player_id)
      const existing = await prisma.weeklyStat.findUnique({
        where: { playerId_week_year: { playerId, week, year } },
      })

      if (existing) {
        // Corregir total acumulado: restar lo viejo, sumar lo nuevo
        await prisma.player.update({
          where: { id: playerId },
          data: { totalPoints: { increment: row.points - existing.points } },
        })
        await prisma.weeklyStat.update({
          where: { playerId_week_year: { playerId, week, year } },
          data: { points: row.points },
        })
      } else {
        await prisma.weeklyStat.create({
          data: { playerId, week, year, points: row.points },
        })
        await prisma.player.update({
          where: { id: playerId },
          data: { totalPoints: { increment: row.points } },
        })
      }

      processed++
    } catch (e) {
      errors.push(`Error en jugador ${row.player_id}: ${e}`)
    }
  }

  return NextResponse.json({ processed, errors, week, year })
}
