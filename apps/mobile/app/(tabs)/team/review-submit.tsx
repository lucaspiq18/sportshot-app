import { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, Alert,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCreateReview } from '../../../src/api/hooks'
import { colors, font, radius, s as t } from '../../../src/theme'

export default function ReviewSubmitScreen() {
  const { bookingId, photographerName, eventName } = useLocalSearchParams<{
    bookingId: string
    photographerName: string
    eventName: string
  }>()
  const router = useRouter()
  const { mutateAsync: createReview, isPending } = useCreateReview()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  async function handleSubmit() {
    if (rating === 0) return Alert.alert('Selecciona una valoración', 'Toca las estrellas para puntuar.')
    await createReview({ bookingId: bookingId!, rating, comment: comment.trim() || undefined })
    Alert.alert('¡Gracias!', 'Tu valoración ha sido publicada.', [{ text: 'OK', onPress: () => router.back() }])
  }

  return (
    <View style={[t.screen, s.container]}>
      <Text style={s.pre}>Valorar</Text>
      <Text style={s.title}>{photographerName}</Text>
      <Text style={s.subtitle}>{eventName}</Text>

      <View style={s.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)} style={s.starBtn}>
            <Text style={[s.star, star <= rating && s.starActive]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>

      {rating > 0 && (
        <Text style={s.ratingLabel}>{['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'][rating]}</Text>
      )}

      <Text style={t.inputLabel}>Comentario (opcional)</Text>
      <TextInput
        style={[t.input, s.textarea]}
        value={comment}
        onChangeText={setComment}
        multiline
        placeholder="¿Cómo fue la experiencia? ¿Recomendarías a este fotógrafo?"
        placeholderTextColor={colors.textMuted}
        maxLength={500}
      />
      <Text style={s.charCount}>{comment.length}/500</Text>

      <TouchableOpacity
        style={[t.btnPrimary, rating === 0 && { opacity: 0.4 }]}
        onPress={handleSubmit}
        disabled={isPending || rating === 0}
      >
        {isPending ? <ActivityIndicator color={colors.bg} /> : <Text style={t.btnPrimaryText}>Publicar valoración</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={[t.btnOutline, { marginTop: 10 }]} onPress={() => router.back()}>
        <Text style={t.btnOutlineText}>Ahora no</Text>
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  container: { padding: 24 },
  pre: { fontFamily: font.label, fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4, marginTop: 16 },
  title: { fontFamily: font.heading, fontSize: 26, color: colors.accent, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 },
  subtitle: { fontFamily: font.body, fontSize: 13, color: colors.textSecondary, marginBottom: 32 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  starBtn: { padding: 4 },
  star: { fontSize: 40, color: colors.border },
  starActive: { color: '#EF9F27' },
  ratingLabel: { fontFamily: font.heading, fontSize: 16, color: '#EF9F27', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 24 },
  textarea: { height: 100, textAlignVertical: 'top', marginBottom: 4 },
  charCount: { fontFamily: font.label, fontSize: 9, color: colors.textMuted, textAlign: 'right', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 0.4 },
})
