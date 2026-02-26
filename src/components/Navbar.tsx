"use client"

import { useState } from "react"
import {
  UserButton,
  SignInButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs"
import Link from "next/link"
import { FaTrophy, FaShieldAlt, FaUsers, FaSignInAlt, FaBars, FaTimes } from "react-icons/fa"

export default function Navbar({ adminLink }: { adminLink: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="relative z-50 rounded-b-xl flex items-center justify-between px-6 py-5 bg-slate-950 border-b border-red-600/50 text-white shadow-xl">
      <Link href="/" className="relative z-50 text-xl font-medium tracking-wide flex items-center gap-3">
        <span className="relative z-10 font-bold tracking-widest uppercase">
          <span className="hidden sm:inline">DBR Fantasy</span>
          <span className="sm:hidden text-lg">DBR</span>
        </span>
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-6 text-sm font-light">
        <Link href="/ranking" className="flex items-center gap-2 hover:text-red-400 transition-colors" title="Ranking">
          <FaTrophy className="text-white" />
          <span>Ranking</span>
        </Link>

        <SignedIn>
          <Link href="/team" className="flex items-center gap-2 hover:text-red-400 transition-colors" title="Mi Equipo">
            <FaShieldAlt className="text-white" />
            <span>Mi Equipo</span>
          </Link>
          <Link href="/draft" className="flex items-center gap-2 hover:text-red-400 transition-colors" title="Draft">
            <FaUsers className="text-white" />
            <span>Draft</span>
          </Link>
          {adminLink}
          <UserButton afterSignOutUrl="/" />
        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal">
            <button className="flex items-center gap-2 bg-red-600/90 text-white px-5 py-1.5 rounded font-light hover:bg-red-600 transition-colors">
              <FaSignInAlt />
              <span>Ingresar</span>
            </button>
          </SignInButton>
        </SignedOut>
      </div>

      {/* Mobile Hamburger Toggle */}
      <button
        className="md:hidden relative z-[60] text-2xl text-white p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Mobile Full-Screen Menu */}
      <div className={`fixed inset-0 bg-slate-950 z-40 flex flex-col items-center justify-center gap-8 transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <Link href="/ranking" onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-2xl font-light hover:text-red-400 transition-colors">
          <FaTrophy />
          <span>Ranking</span>
        </Link>

        <SignedIn>
          <Link href="/team" onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-2xl font-light hover:text-red-400 transition-colors">
            <FaShieldAlt />
            <span>Mi Equipo</span>
          </Link>
          <Link href="/draft" onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-2xl font-light hover:text-red-400 transition-colors">
            <FaUsers />
            <span>Draft</span>
          </Link>
          <div onClick={() => setIsOpen(false)}>
            {adminLink}
          </div>
          <div className="mt-4 scale-150">
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal">
            <button className="flex items-center gap-3 bg-red-600 text-white px-8 py-3 rounded-full text-xl font-light hover:bg-red-500 transition-colors">
              <FaSignInAlt />
              <span>Ingresar</span>
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </nav>
  )
}
