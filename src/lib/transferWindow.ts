export function isTransferWindowOpen(): boolean {
    // Argentina Time (UTC-3)
    const now = new Date()

    // Convert current time to Argentina timezone to ensure we are evaluating the same hour
    const argentinaFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Argentina/Buenos_Aires",
        weekday: "short",
        hour: "numeric",
        minute: "numeric",
        hour12: false,
    })

    // Format gives strings like "Sat, 14:30"
    const parts = argentinaFormatter.formatToParts(now)
    const weekday = parts.find((p) => p.type === "weekday")?.value
    const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10)

    // Rules:
    // Transfers are locked on Saturday (Sat) between 10 AM and 19 PM (10:00 to 19:59)
    if (weekday === "Sat") {
        if (hour >= 10 && hour < 19) {
            return false // Window closed
        }
    }

    return true // Window open
}
