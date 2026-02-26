import Link from "next/link"
import { checkIsAdmin } from "@/lib/isAdmin"

export default async function AdminLink() {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return null
  return (
    <Link href="/admin" className="hover:text-green-200 transition-colors text-yellow-300">
      Admin
    </Link>
  )
}
