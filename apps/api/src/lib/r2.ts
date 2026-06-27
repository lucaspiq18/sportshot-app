import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// R2 expone una API compatible con S3
export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export const BUCKET = process.env.R2_BUCKET_NAME!

// URL prefirmada para subida directa desde la app (PUT)
// Expira en 15 minutos — tiempo suficiente para subir un lote de fotos
export async function presignedUploadUrl(key: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  })
  return getSignedUrl(r2, command, { expiresIn: 900 })
}

// URL prefirmada para descarga privada (GET)
// Expira en 1 hora — el equipo descarga las fotos en ese tiempo
export async function presignedDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key })
  return getSignedUrl(r2, command, { expiresIn: 3600 })
}

// Eliminar un objeto (por si el fotógrafo reemplaza la entrega)
export async function deleteObject(key: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}

// Construir la clave de R2 de forma consistente
export const r2Key = {
  delivery: (bookingId: string, filename: string) =>
    `deliveries/${bookingId}/${filename}`,
  portfolio: (photographerId: string, filename: string) =>
    `portfolio/${photographerId}/${filename}`,
}
