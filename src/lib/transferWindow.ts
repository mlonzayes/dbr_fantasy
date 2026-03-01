import { prisma } from "@/lib/prisma"

export async function isTransferWindowOpen(): Promise<boolean> {
    const config = await prisma.appConfig.findUnique({ where: { id: 1 } })
    return config?.marketOpen ?? false
}
