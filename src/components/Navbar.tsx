"use client"

import { useState, useEffect, useRef } from "react"
import {
  UserButton,
  SignInButton,
  SignedIn,
  SignedOut,
  useAuth,
} from "@clerk/nextjs"
import Link from "next/link"
import { FaTrophy, FaShieldAlt, FaUsers, FaSignInAlt, FaBars, FaTimes, FaBell, FaCalendarAlt } from "react-icons/fa"

interface NotificationItem {
  id: number
  title: string
  message: string
  createdAt: string
  read: boolean
}

function NotificationBell() {
  const { isSignedIn } = useAuth()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isSignedIn) return
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => {
        setNotifications(d.notifications || [])
        setUnreadCount(d.unreadCount || 0)
      })
      .catch(() => {})
  }, [isSignedIn])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const handleOpen = async () => {
    setOpen((prev) => !prev)
    if (!open && unreadCount > 0) {
      await fetch("/api/notifications/read", { method: "POST" })
      setUnreadCount(0)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }
  }

  if (!isSignedIn) return null

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-1 hover:text-red-400 transition-colors"
        title="Notificaciones"
      >
        <FaBell className="text-lg" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-8 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Notificaciones</p>
          </div>
          {notifications.length === 0 ? (
            <div className="px-4 py-6 text-center text-slate-400 text-sm">Sin notificaciones</div>
          ) : (
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
              {notifications.map((n) => (
                <div key={n.id} className={`px-4 py-3 ${n.read ? "" : "bg-blue-50/50"}`}>
                  <p className="text-sm font-medium text-slate-800">{n.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

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
        <Link href="/calendar" className="flex items-center gap-2 hover:text-red-400 transition-colors" title="Calendario">
          <FaCalendarAlt className="text-white" />
          <span>Calendario</span>
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
          <NotificationBell />
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
        <Link href="/calendar" onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-2xl font-light hover:text-red-400 transition-colors">
          <FaCalendarAlt />
          <span>Calendario</span>
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
