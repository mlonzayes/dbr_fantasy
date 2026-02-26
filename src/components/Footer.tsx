import { GiRugbyConversion } from "react-icons/gi"
import { FaHeart } from "react-icons/fa"

export default function Footer() {
    return (
        <footer className="bg-slate-950 text-slate-400 py-8 border-t border-slate-900 mt-auto">
            <div className="max-w-3xl mx-auto px-6 flex flex-col items-center justify-center space-y-4">
                <div className="flex items-center gap-2 text-slate-300">
                    <GiRugbyConversion className="text-2xl text-red-500" />
                    <span className="text-base font-light tracking-wide">Rugby Fantasy <span className="text-red-500">Don Bosco Rugby</span></span>
                </div>
                <p className="text-xs font-light tracking-widest uppercase">
                    Arma tu equipo, suma puntos, gana el ranking
                </p>
                <div className="text-xs font-light text-slate-600 flex items-center justify-center gap-1 mt-6">
                    © {new Date().getFullYear()} Don Bosco Rugby. Creado por <span className="text-red-500">MW Studio Digital</span>
                </div>
            </div>
        </footer>
    )
}
