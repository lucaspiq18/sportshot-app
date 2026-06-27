import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCreateOffer } from '../../../src/api/hooks'
import { colors, font, radius, s as t } from '../../../src/theme'

export default function OfferScreen() {
  const { slotId, photographerName } = useLocalSearchParams<{ slotId: string; photographerName: string }>()
  const router = useRouter()
  const { mutateAsync: createOffer, isPending } = useCreateOffer()

  const [form, setForm] = useState({
    eventName: '',
    budgetOffered: '',
    photoCount: '',
    deliveryHours: '48',
    message: '',
  })

  async function handleSubmit() {
    if (!form.eventName || !form.budgetOffered || !form.photoCount) {
      return Alert.alert('Faltan datos', 'Completa evento, presupuesto y número de fotos.')
    }
    await createOffer({
      slotId: slotId!,
      eventName: form.eventName,
      budgetOffered: Math.round(parseFloat(form.budgetOffered) * 100),
      deliverables: { photoCount: parseInt(form.photoCount), deliveryHours: parseInt(form.deliveryHours) },
      message: form.message || undefined,
      expiresAt: new Date(Date.now() + 48 * 3_600_000).toISOString(),
    })
    Alert.alert('Oferta enviada', 'El fotógrafo ha sido notificado.', [{ text: 'OK', onPress: () => router.back() }])
  }

  return (
    <ScrollView style={t.screen} contentContainerStyle={s.content}>
      <Text style={s.pre}>Oferta para</Text>
      <Text style={s.title}>{photographerName}</Text>

      <Text style={t.inputLabel}>Nombre del evento</Text>
      <TextInput style={t.input} value={form.eventName} onChangeText={(v) => setForm((f) => ({ ...f, eventName: v }))} placeholder="Final Liga Juvenil" placeholderTextColor={colors.textMuted} />

      <Text style={t.inputLabel}>Tu oferta (€)</Text>
      <TextInput style={[t.input, s.bigInput]} keyboardType="decimal-pad" value={form.budgetOffered} onChangeText={(v) => setForm((f) => ({ ...f, budgetOffered: v }))} placeholder="350" placeholderTextColor={colors.textMuted} />

      <View style={s.row}>
        <View style={s.half}>
          <Text style={t.inputLabel}>Fotos a entregar</Text>
          <TextInput style={t.input} keyboardType="number-pad" value={form.photoCount} onChangeText={(v) => setForm((f) => ({ ...f, photoCount: v }))} placeholder="50" placeholderTextColor={colors.textMuted} />
        </View>
        <View style={s.half}>
          <Text style={t.inputLabel}>Plazo entrega (h)</Text>
          <TextInput style={t.input} keyboardType="number-pad" value={form.deliveryHours} onChangeText={(v) => setForm((f) => ({ ...f, deliveryHours: v }))} placeholder="48" placeholderTextColor={colors.textMuted} />
        </View>
      </View>

      <Text style={t.inputLabel}>Mensaje (opcional)</Text>
      <TextInput style={[t.input, s.textarea]} multiline value={form.message} onChangeText={(v) => setForm((f) => ({ ...f, message: v }))} placeholder="Cuéntale los detalles del evento..." placeholderTextColor={colors.textMuted} />

      <TouchableOpacity style={t.btnPrimary} onPress={handleSubmit} disabled={isPending}>
        {isPending ? <ActivityIndicator color={colors.bg} /> : <Text style={t.btnPrimaryText}>Enviar oferta</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={[t.btnOutline, { marginTop: 10 }]} onPress={() => router.back()}>
        <Text style={t.btnOutlineText}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  pre: { fontFamily: font.label, fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  title: { fontFamily: font.heading, fontSize: 26, color: colors.accent, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 24 },
  bigInput: { fontFamily: font.heading, fontSize: 28, color: colors.accent, letterSpacing: 1, paddingVertical: 14 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  textarea: { height: 80, textAlignVertical: 'top' },
})
