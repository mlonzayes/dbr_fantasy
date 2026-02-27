"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Modal from "@/components/Modal"

export default function AdminDeletePlayerButton({ playerId, playerName }: { playerId: number; playerName: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const handleDelete = async () => {
    setModalOpen(false)
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/players/${playerId}`, { method: "DELETE" })
      if (res.ok) router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Modal
        isOpen={modalOpen}
        title="Eliminar jugador"
        message={`¿Eliminar a ${playerName}? Se reembolsará el precio a los usuarios que lo tengan.`}
        onCancel={() => setModalOpen(false)}
        onConfirm={handleDelete}
        confirmLabel="Eliminar"
        variant="danger"
      />
      <button
        onClick={() => setModalOpen(true)}
        disabled={loading}
        className="text-red-500 hover:text-red-700 text-xs font-medium disabled:opacity-50 transition-colors"
      >
        {loading ? "..." : "Eliminar"}
      </button>
    </>
  )
}
