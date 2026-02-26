import { redirect } from "next/navigation"
import { checkIsAdmin } from "@/lib/isAdmin"
import AdminUploadForm from "./AdminUploadForm"
import { prisma } from "@/lib/prisma"

export default async function AdminPage() {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) redirect("/")

  const players = await prisma.player.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
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
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Puntos</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => (
                <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-400 font-mono">{p.id}</td>
                  <td className="px-4 py-2 font-medium">{p.name}</td>
                  <td className="px-4 py-2 text-gray-500">{p.position}</td>
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
