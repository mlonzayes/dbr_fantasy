import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import sharp from "sharp"
import { prisma } from "@/lib/prisma"
import { checkIsAdmin } from "@/lib/isAdmin"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: Request) {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

    const formData = await req.formData()
    const playerId = formData.get("playerId")
    const file = formData.get("image") as File | null

    if (!playerId || !file) {
        return NextResponse.json({ error: "Faltan playerId o imagen" }, { status: 400 })
    }

    const id = Number(playerId)
    if (isNaN(id)) {
        return NextResponse.json({ error: "playerId inválido" }, { status: 400 })
    }

    try {
        const arrayBuffer = await file.arrayBuffer()
        const inputBuffer = Buffer.from(arrayBuffer)

        // Convertir a WebP con sharp (max 400x400, calidad 85)
        const webpBuffer = await sharp(inputBuffer)
            .resize(400, 400, { fit: "cover", position: "top" })
            .webp({ quality: 85 })
            .toBuffer()

        // Subir a Cloudinary como stream desde buffer
        const imageUrl = await new Promise<string>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "fantasy/players",
                    public_id: `player_${id}`,
                    overwrite: true,
                    format: "webp",
                },
                (error, result) => {
                    if (error || !result) return reject(error ?? new Error("Sin resultado"))
                    resolve(result.secure_url)
                }
            )
            uploadStream.end(webpBuffer)
        })

        await prisma.player.update({
            where: { id },
            data: { imageUrl },
        })

        return NextResponse.json({ imageUrl })
    } catch (error) {
        console.error("Error subiendo imagen:", error)
        return NextResponse.json({ error: "Error al procesar o subir la imagen" }, { status: 500 })
    }
}
