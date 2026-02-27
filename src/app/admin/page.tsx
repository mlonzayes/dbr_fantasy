import { redirect } from "next/navigation"
import { Suspense } from "react"
import Image from "next/image"
import { checkIsAdmin } from "@/lib/isAdmin"
import { prisma } from "@/lib/prisma"
import { clerkClient } from "@clerk/nextjs/server"
import AdminUploadForm from "./AdminUploadForm"
import AdminPlayerForm from "./AdminPlayerForm"
import AdminBulkPlayerForm from "./AdminBulkPlayerForm"
import AdminCalendarForm from "./AdminCalendarForm"
import AdminNotificationForm from "./AdminNotificationForm"
import AdminCoachForm from "./AdminCoachForm"
import AdminTabs from "./AdminTabs"
import AdminDeletePlayerButton from "./AdminDeletePlayerButton"
import AdminDeleteMatchButton from "./AdminDeleteMatchButton"
import AdminExcelForm from "./AdminExcelForm"

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) redirect("/")

  const { tab = "puntos" } = await searchParams

  return (
    <div className="w-full bg-gray-50 flex-1">
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Panel de Administración</h1>
        <Suspense>
          <AdminTabs />
        </Suspense>
        {tab === "puntos" && <TabPuntos />}
        {tab === "excel" && <TabExcel />}
        {tab === "jugadores" && <TabJugadores />}
        {tab === "entrenadores" && <TabEntrenadores />}
        {tab === "calendario" && <TabCalendario />}
        {tab === "notificaciones" && <TabNotificaciones />}
        {tab === "usuarios" && <TabUsuarios />}
      </div>
    </div>
  )
}

function TabExcel() {
  return (
    <div>
      <AdminExcelForm />
    </div>
  )
}

async function TabPuntos() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">Subir puntos semanales</h2>
      <p className="text-sm text-gray-500 mb-4">
        Archivo Excel con columnas <code className="bg-gray-100 px-1 rounded">player_id</code> y{" "}
        <code className="bg-gray-100 px-1 rounded">points</code>.
      </p>
      <AdminUploadForm />
    </div>
  )
}

async function TabJugadores() {
  const players = await prisma.player.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
  })

  return (
    <div className="space-y-6">
      <div className="bg-white rounded border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-light text-slate-800 mb-4 pb-2 border-b border-slate-100">Crear Jugador Manual</h2>
        <AdminPlayerForm />
      </div>
      <div className="bg-white rounded border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-light text-slate-800 mb-2 pb-2 border-b border-slate-100">Cargar Jugadores Masivamente</h2>
        <p className="text-sm text-slate-500 mb-4 font-light">
          Archivo <code className="bg-slate-100 px-1 rounded">.xlsx</code> con columnas{" "}
          <code className="bg-slate-100 px-1 rounded text-red-600">name</code>,{" "}
          <code className="bg-slate-100 px-1 rounded text-red-600">position</code> y{" "}
          <code className="bg-slate-100 px-1 rounded text-red-600">price</code>.
        </p>
        <AdminBulkPlayerForm />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <h2 className="text-lg font-semibold text-gray-800 px-6 py-4 border-b border-gray-100">
          Jugadores registrados ({players.length})
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-4 py-3 font-semibold text-gray-600">ID</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Nombre</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Posición</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">División</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Precio</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Puntos</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-400 font-mono">{p.id}</td>
                <td className="px-4 py-2 font-medium">{p.name}</td>
                <td className="px-4 py-2 text-gray-500">{p.position}</td>
                <td className="px-4 py-2">
                  {p.division ? (
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">{p.division}</span>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-2 text-right font-medium text-emerald-600">${p.currentPrice}</td>
                <td className="px-4 py-2 text-right font-semibold text-green-700">{p.totalPoints}</td>
                <td className="px-4 py-2 text-right">
                  <AdminDeletePlayerButton playerId={p.id} playerName={p.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

async function TabEntrenadores() {
  const coaches = await prisma.coach.findMany({ orderBy: { name: "asc" } })

  return (
    <div className="space-y-6">
      <div className="bg-white rounded border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-light text-slate-800 mb-4 pb-2 border-b border-slate-100">Crear Entrenador</h2>
        <AdminCoachForm />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <h2 className="text-lg font-semibold text-gray-800 px-6 py-4 border-b border-gray-100">
          Entrenadores registrados ({coaches.length})
        </h2>
        {coaches.length === 0 ? (
          <p className="px-6 py-6 text-slate-400 text-sm">No hay entrenadores cargados todavía.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">ID</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Foto</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Nombre</th>
              </tr>
            </thead>
            <tbody>
              {coaches.map((c) => (
                <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-400 font-mono">{c.id}</td>
                  <td className="px-4 py-2">
                    {c.imageUrl ? (
                      <Image src={c.imageUrl} alt={c.name} width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold">DT</span>
                    )}
                  </td>
                  <td className="px-4 py-2 font-medium">{c.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

async function TabCalendario() {
  const matches = await prisma.match.findMany({ orderBy: { date: "asc" } })
  const fmt = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  })

  return (
    <div className="space-y-6">
      <div className="bg-white rounded border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-light text-slate-800 mb-4 pb-2 border-b border-slate-100">Agregar Partido</h2>
        <AdminCalendarForm />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <h2 className="text-lg font-semibold text-gray-800 px-6 py-4 border-b border-gray-100">
          Partidos programados ({matches.length})
        </h2>
        {matches.length === 0 ? (
          <p className="px-6 py-6 text-slate-400 text-sm">No hay partidos cargados todavía.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Jornada</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Partido</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Estadio</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Fecha</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {matches.map((m) => (
                <tr key={m.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-500">{m.round}</td>
                  <td className="px-4 py-2 font-medium">{m.homeTeam} vs {m.awayTeam}</td>
                  <td className="px-4 py-2 text-gray-500">{m.stadium}</td>
                  <td className="px-4 py-2 text-gray-500 whitespace-nowrap">{fmt.format(new Date(m.date))}</td>
                  <td className="px-4 py-2 text-right">
                    <AdminDeleteMatchButton matchId={m.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

async function TabNotificaciones() {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  })
  const fmt = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  })

  return (
    <div className="space-y-6">
      <div className="bg-white rounded border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-light text-slate-800 mb-2 pb-2 border-b border-slate-100">Enviar Notificación</h2>
        <p className="text-sm text-slate-500 mb-4">Se mostrará a todos los usuarios en la campana del navbar.</p>
        <AdminNotificationForm />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <h2 className="text-lg font-semibold text-gray-800 px-6 py-4 border-b border-gray-100">
          Notificaciones enviadas ({notifications.length})
        </h2>
        {notifications.length === 0 ? (
          <p className="px-6 py-6 text-slate-400 text-sm">No hay notificaciones enviadas todavía.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Título</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Mensaje</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Enviada</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((n) => (
                <tr key={n.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{n.title}</td>
                  <td className="px-4 py-2 text-gray-500 max-w-xs truncate">{n.message}</td>
                  <td className="px-4 py-2 text-gray-400 whitespace-nowrap text-xs">{fmt.format(new Date(n.createdAt))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

async function TabUsuarios() {
  const users = await prisma.user.findMany({
    include: { team: { include: { players: { include: { player: true } } } } },
  })

  const userIds = users.map((u) => u.id)
  let userMap: Record<string, string> = {}
  if (userIds.length > 0) {
    const clerk = await clerkClient()
    const usersResponse = await clerk.users.getUserList({ userId: userIds })
    userMap = Object.fromEntries(
      usersResponse.data.map((u) => [
        u.id,
        [u.firstName, u.lastName].filter(Boolean).join(" ") ||
          u.emailAddresses[0]?.emailAddress ||
          "Usuario",
      ])
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
      <h2 className="text-lg font-semibold text-gray-800 px-6 py-4 border-b border-gray-100">
        Usuarios y Presupuestos ({users.length})
      </h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Usuario</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Equipo</th>
            <th className="text-right px-4 py-3 font-semibold text-gray-600">Valor Equipo</th>
            <th className="text-right px-4 py-3 font-semibold text-gray-600">Saldo Disp.</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const teamValue = u.team?.players.reduce((sum, tp) => sum + tp.player.currentPrice, 0) || 0
            return (
              <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{userMap[u.id] || "Usuario"}</td>
                <td className="px-4 py-3 text-gray-500">
                  {u.team?.name || <span className="text-gray-400 italic">Sin equipo</span>}
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-700">${teamValue}</td>
                <td className="px-4 py-3 text-right font-semibold text-emerald-700">${u.balance}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
