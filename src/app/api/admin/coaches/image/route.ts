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
    const coachId = formData.get("coachId")
    const file = formData.get("image") as File | null

    if (!coachId || !file) {
        return NextResponse.json({ error: "Faltan coachId o imagen" }, { status: 400 })
    }

    const id = Number(coachId)
    if (isNaN(id)) return NextResponse.json({ error: "coachId inválido" }, { status: 400 })

    try {
        const webpBuffer = await sharp(Buffer.from(await file.arrayBuffer()))
            .resize(400, 400, { fit: "cover", position: "top" })
            .webp({ quality: 85 })
            .toBuffer()

        const imageUrl = await new Promise<string>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: "fantasy/coaches", public_id: `coach_${id}`, overwrite: true, format: "webp" },
                (err, result) => {
                    if (err || !result) return reject(err ?? new Error("Sin resultado"))
                    resolve(result.secure_url)
                }
            )
            stream.end(webpBuffer)
        })

        await prisma.coach.update({ where: { id }, data: { imageUrl } })
        return NextResponse.json({ imageUrl })
    } catch (error) {
        console.error("Error subiendo imagen de entrenador:", error)
        return NextResponse.json({ error: "Error al procesar o subir la imagen" }, { status: 500 })
    }
}
