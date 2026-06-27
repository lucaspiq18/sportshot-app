import { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Image, ActivityIndicator, Alert, FlatList, Dimensions,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useDownloadUrls } from '../../../src/api/uploads'
import { useApi } from '../../../src/api/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { colors, font, radius, s as t } from '../../../src/theme'

const { width } = Dimensions.get('window')
const PHOTO_SIZE = (width - 48 - 8) / 3

export default function ReviewDeliveryScreen() {
  const { bookingId, eventName, photoCount } = useLocalSearchParams<{
    bookingId: string; eventName: string; photoCount: string
  }>()
  const router = useRouter()
  const qc = useQueryClient()

  const { mutateAsync: getUrls, isPending: loadingUrls, data: urlData } = useDownloadUrls()
  const { post } = useApi()

  const { mutateAsync: approveDelivery, isPending: approving } = useMutation({
    mutationFn: () => post(`/bookings/${bookingId}/delivery/approve`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] })
      Alert.alert('Fotos aprobadas', 'El pago se ha liberado al fotógrafo.', [{ text: 'OK', onPress: () => router.back() }])
    },
  })

  return (
    <ScrollView style={t.screen} contentContainerStyle={s.content}>
      <Text style={s.title}>{eventName}</Text>
      <Text style={s.subtitle}>{photoCount} fotos entregadas</Text>

      {!urlData ? (
        <TouchableOpacity style={s.loadBtn} onPress={() => getUrls(bookingId!)} disabled={loadingUrls}>
          {loadingUrls ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <>
              <Text style={s.loadIcon}>🔒</Text>
              <Text style={s.loadTitle}>Cargar fotos seguras</Text>
              <Text style={s.loadHint}>Las URLs expiran en 1h por seguridad</Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <>
          <FlatList
            data={urlData.urls}
            keyExtractor={(_, i) => i.toString()}
            numColumns={3}
            scrollEnabled={false}
            columnWrapperStyle={{ gap: 4, marginBottom: 4 }}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={s.photo} resizeMode="cover" />
            )}
          />
          <View style={s.expiryNote}>
            <Text style={s.expiryText}>URLs de descarga expiran en 1 hora</Text>
          </View>
        </>
      )}

      <View style={s.actions}>
        <TouchableOpacity
          style={s.disputeBtn}
          onPress={() => Alert.alert('Disputa', `Para abrir una disputa, escríbenos a hola@sportshot.app con el ID: ${bookingId}`)}
        >
          <Text style={s.disputeText}>Disputar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.approveBtn}
          onPress={() => Alert.alert('Aprobar entrega', '¿Confirmas que el material es correcto? El pago se liberará al fotógrafo.', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Aprobar', onPress: () => approveDelivery() },
          ])}
          disabled={approving}
        >
          {approving ? <ActivityIndicator color={colors.bg} /> : <Text style={s.approveText}>Aprobar y pagar</Text>}
        </TouchableOpacity>
      </View>

      <Text style={s.autoNote}>
        Si no actúas, el pago se liberará automáticamente al expirar el plazo de revisión.
      </Text>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  title: { fontFamily: font.heading, fontSize: 22, color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  subtitle: { fontFamily: font.body, fontSize: 13, color: colors.textSecondary, marginBottom: 20 },
  loadBtn: { borderWidth: 0.5, borderColor: colors.border, borderRadius: radius.md, padding: 28, alignItems: 'center', backgroundColor: colors.card, marginBottom: 20 },
  loadIcon: { fontSize: 28, marginBottom: 8 },
  loadTitle: { fontFamily: font.heading, fontSize: 15, color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  loadHint: { fontFamily: font.body, fontSize: 12, color: colors.textMuted },
  photo: { width: PHOTO_SIZE, height: PHOTO_SIZE, borderRadius: radius.sm, backgroundColor: colors.card },
  expiryNote: { backgroundColor: colors.warningBg, borderRadius: radius.sm, padding: 10, marginTop: 12, marginBottom: 20, borderWidth: 0.5, borderColor: colors.warningBorder },
  expiryText: { fontFamily: font.label, fontSize: 11, color: colors.warning, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 },
  actions: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  disputeBtn: { flex: 1, borderWidth: 0.5, borderColor: colors.danger, borderRadius: radius.sm, paddingVertical: 14, alignItems: 'center' },
  disputeText: { fontFamily: font.heading, fontSize: 13, color: colors.danger, textTransform: 'uppercase', letterSpacing: 0.8 },
  approveBtn: { flex: 2, backgroundColor: colors.accent, borderRadius: radius.sm, paddingVertical: 14, alignItems: 'center' },
  approveText: { fontFamily: font.heading, fontSize: 13, color: colors.bg, textTransform: 'uppercase', letterSpacing: 0.8 },
  autoNote: { fontFamily: font.body, fontSize: 12, color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
})
