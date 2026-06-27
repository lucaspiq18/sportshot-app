import * as ImagePicker from 'expo-image-picker'
import { useApi } from './client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface UploadUrlEntry {
  key: string
  uploadUrl: string
  filename: string
}

// Subir un archivo directamente a R2 usando la URL prefirmada
async function uploadFileToR2(uploadUrl: string, uri: string, contentType: string): Promise<void> {
  const res = await fetch(uri)
  const blob = await res.blob()

  const upload = await fetch(uploadUrl, {
    method: 'PUT',
    body: blob,
    headers: { 'Content-Type': contentType },
  })

  if (!upload.ok) throw new Error(`Upload fallido: ${upload.status}`)
}

export function useDeliveryUpload() {
  const { post } = useApi()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      bookingId,
      onProgress,
    }: {
      bookingId: string
      onProgress?: (uploaded: number, total: number) => void
    }) => {
      // 1. Seleccionar fotos de la galería
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.9,
        exif: false,
      })

      if (result.canceled || result.assets.length === 0) {
        throw new Error('CANCELLED')
      }

      const assets = result.assets

      // 2. Pedir URLs prefirmadas al API
      const { urls } = await post<{ urls: UploadUrlEntry[] }>('/uploads/delivery', {
        bookingId,
        files: assets.map((a) => ({
          filename: a.fileName ?? `foto-${Date.now()}.jpg`,
          contentType: (a.mimeType as 'image/jpeg') ?? 'image/jpeg',
          sizeBytes: a.fileSize ?? 1,
        })),
      })

      // 3. Subir cada foto directamente a R2
      let uploaded = 0
      await Promise.all(
        urls.map(async ({ uploadUrl, key }, i) => {
          const asset = assets[i]
          await uploadFileToR2(uploadUrl, asset.uri, asset.mimeType ?? 'image/jpeg')
          uploaded++
          onProgress?.(uploaded, assets.length)
        })
      )

      // 4. Confirmar la entrega en el API
      await post('/uploads/delivery/confirm', {
        bookingId,
        keys: urls.map((u) => u.key),
      })

      return { photoCount: assets.length }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}

export function useDownloadUrls() {
  const { post } = useApi()
  return useMutation({
    mutationFn: (bookingId: string) =>
      post<{ urls: string[]; expiresIn: number }>('/uploads/delivery/download-urls', { bookingId }),
  })
}
