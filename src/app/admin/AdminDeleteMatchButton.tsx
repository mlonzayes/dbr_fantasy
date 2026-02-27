"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Modal from "@/components/Modal"

export default function AdminDeleteMatchButton({ matchId }: { matchId: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const handleDelete = async () => {
    setModalOpen(false)
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/calendar/${matchId}`, { method: "DELETE" })
      if (res.ok) router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Modal
        isOpen={modalOpen}
        title="Eliminar partido"
        message="¿Estás seguro de que querés eliminar este partido?"
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
