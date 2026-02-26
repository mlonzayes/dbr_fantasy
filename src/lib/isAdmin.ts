import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function checkIsAdmin(): Promise<boolean> {
  const { userId } = await auth()
  if (!userId) return false
  const user = await prisma.user.findUnique({ where: { id: userId } })
  return user?.isAdmin ?? false
}
