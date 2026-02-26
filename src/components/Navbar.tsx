import {
  UserButton,
  SignInButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs"
import Link from "next/link"
import AdminLink from "./AdminLink"

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-green-800 text-white shadow-sm">
      <Link href="/" className="text-xl font-bold tracking-tight">
        🏉 Rugby Fantasy
      </Link>

      <div className="flex items-center gap-5 text-sm font-medium">
        <Link href="/ranking" className="hover:text-green-200 transition-colors">
          Ranking
        </Link>

        <SignedIn>
          <Link href="/team" className="hover:text-green-200 transition-colors">
            Mi Equipo
          </Link>
          <Link href="/draft" className="hover:text-green-200 transition-colors">
            Draft
          </Link>
          <AdminLink />
          <UserButton afterSignOutUrl="/" />
        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal">
            <button className="bg-white text-green-800 px-4 py-1.5 rounded-lg font-semibold hover:bg-green-50 transition-colors">
              Ingresar
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </nav>
  )
}
