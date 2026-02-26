import { ClerkProvider } from "@clerk/nextjs"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import AdminLink from "@/components/AdminLink"

const poppins = Poppins({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Rugby Fantasy",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="es" className={`${poppins.variable}`}>
        <body className="font-sans antialiased font-light text-slate-800 bg-slate-50 min-h-screen flex flex-col">
          <Navbar adminLink={<AdminLink />} />
          <main className="flex-1 w-full flex flex-col">
            {children}
          </main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  )
}
