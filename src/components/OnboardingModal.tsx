"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"

const STORAGE_KEY = "dbr-onboarding-v1"

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="w-7 h-7 rounded-full bg-slate-950 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
        {number}
      </div>
      <div>
        <p className="font-semibold text-slate-900 text-sm">{title}</p>
        <p className="text-slate-500 text-sm mt-0.5 font-light leading-relaxed">{children}</p>
      </div>
    </div>
  )
}

export default function OnboardingModal() {
  const { isSignedIn } = useAuth()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isSignedIn) return
    const seen = localStorage.getItem(STORAGE_KEY)
    if (!seen) setVisible(true)
  }, [isSignedIn])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">

        {/* Header */}
        <div className="bg-slate-950 px-6 py-5">
          <h2 className="text-white text-xl font-bold tracking-wide">
            Bienvenido a DBR <span className="italic font-extrabold">Fantasy</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1 font-light">Todo lo que necesitás saber para empezar.</p>
        </div>

        {/* Steps */}
        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
          <Step number={1} title="Armá tu equipo">
            Entrá al <strong>Draft</strong> y elegí exactamente 15 jugadores respetando las posiciones del rugby: 2 pilares, 1 hooker, 2 segundas líneas, 2 alas, 1 N°8, 1 medio scrum, 1 apertura, 2 centros, 2 wings y 1 fullback. Tenés un presupuesto de <strong>$1.250</strong> para gastar.
          </Step>

          <Step number={2} title="Acumulá puntos">
            Cada jornada el administrador carga los puntos de cada jugador según su rendimiento en el partido. Tu equipo suma los puntos de todos tus 15 jugadores. El ranking se actualiza automáticamente.
          </Step>

          <Step number={3} title="Mercado de pases">
            Podés <strong>vender</strong> jugadores de tu equipo y recuperar su precio actual. Con ese saldo podés <strong>comprar</strong> nuevos jugadores para mejorar tu plantilla. El mercado se cierra los <strong>sábados de 10:00 a 19:00 hs</strong> (hora Argentina), justo antes de los partidos.
          </Step>

          <Step number={4} title="El objetivo">
            Acumular la mayor cantidad de puntos posible durante toda la temporada. Seguí tu posición en el ranking de la página principal. ¡El mejor equipo al final de la temporada gana!
          </Step>

          <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-sm text-orange-800">
            <strong>Importante:</strong> No podés modificar tu equipo durante la ventana de cierre del mercado (sábados 10:00–19:00 hs). Planificá tus cambios con anticipación.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={dismiss}
            className="bg-slate-950 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            ¡Entendido, a jugar!
          </button>
        </div>
      </div>
    </div>
  )
}
