import { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useDeliveryUpload } from '../../../src/api/uploads'
import { colors, font, radius, s as t } from '../../../src/theme'

export default function DeliverScreen() {
  const { bookingId, eventName } = useLocalSearchParams<{ bookingId: string; eventName: string }>()
  const router = useRouter()
  const { mutateAsync: uploadDelivery, isPending } = useDeliveryUpload()
  const [progress, setProgress] = useState<{ uploaded: number; total: number } | null>(null)

  async function handleUpload() {
    try {
      const result = await uploadDelivery({
        bookingId: bookingId!,
        onProgress: (uploaded, total) => setProgress({ uploaded, total }),
      })
      Alert.alert(
        'Material entregado',
        `${result.photoCount} fotos subidas. El equipo tiene 48h para revisar.`,
        [{ text: 'OK', onPress: () => router.back() }]
      )
    } catch (e: any) {
      if (e.message === 'CANCELLED') return
      Alert.alert('Error al subir', e.message)
    } finally {
      setProgress(null)
    }
  }

  return (
    <View style={[t.screen, s.container]}>
      <View style={s.iconBlock}>
        <Text style={s.iconText}>📷</Text>
      </View>

      <Text style={s.title}>Entregar material</Text>
      <Text style={s.subtitle}>{eventName}</Text>

      <View style={s.steps}>
        {[
          'Selecciona todas las fotos del evento desde tu galería',
          'Las fotos se subirán directamente a nuestro almacenamiento seguro',
          'El equipo recibe notificación y tiene 48h para aprobar',
          'Al aprobar, recibirás la transferencia automáticamente',
        ].map((text, i) => (
          <View key={i} style={s.step}>
            <View style={s.stepNum}><Text style={s.stepNumText}>{i + 1}</Text></View>
            <Text style={s.stepText}>{text}</Text>
          </View>
        ))}
      </View>

      {isPending && progress && (
        <View style={s.progressBox}>
          <Text style={s.progressText}>Subiendo {progress.uploaded} de {progress.total} fotos...</Text>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${Math.round(progress.uploaded / progress.total * 100)}%` }]} />
          </View>
        </View>
      )}

      <TouchableOpacity style={t.btnPrimary} onPress={handleUpload} disabled={isPending}>
        {isPending ? <ActivityIndicator color={colors.bg} /> : <Text style={t.btnPrimaryText}>Seleccionar y subir fotos</Text>}
      </TouchableOpacity>

      <Text style={s.note}>JPG · PNG · WebP · Máx. 50 MB por foto · Máx. 200 fotos</Text>
    </View>
  )
}

const s = StyleSheet.create({
  container: { padding: 24, justifyContent: 'center' },
  iconBlock: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#0d2030', borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16 },
  iconText: { fontSize: 28 },
  title: { fontFamily: font.heading, fontSize: 26, color: colors.accent, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 },
  subtitle: { fontFamily: font.body, fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginBottom: 28 },
  steps: { gap: 12, marginBottom: 28 },
  step: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.card, borderWidth: 0.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  stepNumText: { fontFamily: font.heading, fontSize: 11, color: colors.accent },
  stepText: { fontFamily: font.body, fontSize: 13, color: colors.textSecondary, flex: 1, lineHeight: 20 },
  progressBox: { backgroundColor: colors.card, borderRadius: radius.sm, padding: 14, marginBottom: 16, borderWidth: 0.5, borderColor: colors.border },
  progressText: { fontFamily: font.body, fontSize: 13, color: colors.textSecondary, marginBottom: 8, textAlign: 'center' },
  progressBar: { height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 2 },
  note: { fontFamily: font.label, fontSize: 10, color: colors.textMuted, textAlign: 'center', lineHeight: 17, marginTop: 12, textTransform: 'uppercase', letterSpacing: 0.4 },
})
