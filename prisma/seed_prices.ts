import { prisma } from "../src/lib/prisma"

async function main() {
    console.log("Seeding random base prices for existing players...")

    // Reset starting balance per user just in case
    await prisma.user.updateMany({
        data: { balance: 1250 }
    })

    const players = await prisma.player.findMany()

    for (const player of players) {
        // Math.random() generates between 0 and 1. We want 1-150.
        const ranPrice = Math.floor(Math.random() * 150) + 1

        await prisma.player.update({
            where: { id: player.id },
            data: {
                basePrice: ranPrice,
                currentPrice: ranPrice
            }
        })
    }

    console.log(`Updated ${players.length} players with random starting prices between 1 and 150.`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
