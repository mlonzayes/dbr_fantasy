import { redirect } from "next/navigation"
import { checkIsAdmin } from "@/lib/isAdmin"
import AdminUploadForm from "./AdminUploadForm"
import AdminPlayerForm from "./AdminPlayerForm"
import AdminBulkPlayerForm from "./AdminBulkPlayerForm"
import { prisma } from "@/lib/prisma"
import { clerkClient } from "@clerk/nextjs/server"

export default async function AdminPage() {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) redirect("/")

  const players = await prisma.player.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
  })

  // Fetch users and their teams to display balances
  const users = await prisma.user.findMany({
    include: {
      team: {
        include: {
          players: {
            include: { player: true }
          }
        }
      }
    }
  })

  const userIds = users.map((u: any) => u.id)
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
    <div className="w-full bg-gray-50 flex-1">
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Panel de Administración</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Subir puntos (Excel)</h2>
          <p className="text-sm text-gray-500 mb-4">
            El archivo Excel debe tener una hoja con columnas:{" "}
            <code className="bg-gray-100 px-1 rounded">player_id</code> y{" "}
            <code className="bg-gray-100 px-1 rounded">points</code>.
          </p>
          <AdminUploadForm />
        </div>

        <div className="bg-white rounded border border-slate-200 p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-light text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            Crear Jugador Manual
          </h2>
          <p className="text-sm text-slate-500 mb-4 font-light">
            Usá este formulario para agregar un jugador específico sin tener que subir un archivo de Excel.
          </p>
          <AdminPlayerForm />
        </div>

        <div className="bg-white rounded border border-slate-200 p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-light text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            Cargar Jugadores Masivamente
          </h2>
          <p className="text-sm text-slate-500 mb-4 font-light">
            Subí un archivo <code className="bg-slate-100 px-1 rounded">.xlsx</code> con las columnas <code className="bg-slate-100 px-1 rounded text-red-600">name</code>, <code className="bg-slate-100 px-1 rounded text-red-600">position</code> y <code className="bg-slate-100 px-1 rounded text-red-600">price</code> para cargar toda tu base inicial de jugadores.
          </p>
          <AdminBulkPlayerForm />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto mb-8">
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
              {users.map((u: any) => {
                const teamValue = u.team?.players.reduce((sum: number, tp: any) => sum + tp.player.currentPrice, 0) || 0
                return (
                  <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{userMap[u.id] || "Usuario"}</td>
                    <td className="px-4 py-3 text-gray-500">{u.team?.name || <span className="text-gray-400 italic">Sin equipo</span>}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-700">${teamValue}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-700">${u.balance}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
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
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Precio</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Puntos</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p: any) => (
                <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-400 font-mono">{p.id}</td>
                  <td className="px-4 py-2 font-medium">{p.name}</td>
                  <td className="px-4 py-2 text-gray-500">{p.position}</td>
                  <td className="px-4 py-2 text-right font-medium text-emerald-600">${p.currentPrice}</td>
                  <td className="px-4 py-2 text-right font-semibold text-green-700">
                    {p.totalPoints}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
