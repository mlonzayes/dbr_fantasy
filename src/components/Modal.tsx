"use client"

interface ModalProps {
  isOpen: boolean
  title: string
  message: string
  onCancel: () => void
  onConfirm?: () => void
  confirmLabel?: string
  cancelLabel?: string
  variant?: "danger" | "default"
}

export default function Modal({
  isOpen,
  title,
  message,
  onCancel,
  onConfirm,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
}: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5">
          <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
          <p className="text-sm text-slate-500">{message}</p>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          {onConfirm && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              {cancelLabel}
            </button>
          )}
          <button
            onClick={() => { onConfirm ? onConfirm() : onCancel() }}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
              onConfirm
                ? variant === "danger"
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-slate-900 text-white hover:bg-slate-800"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            {onConfirm ? confirmLabel : "Aceptar"}
          </button>
        </div>
      </div>
    </div>
  )
}
