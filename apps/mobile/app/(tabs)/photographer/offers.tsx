import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native'
import { useReceivedOffers, useAcceptOffer, useRejectOffer } from '../../../src/api/hooks'
import { colors, font, radius, s as t, statusBadge } from '../../../src/theme'
import type { OfferWithDetails } from '@sportshot/types/src/api'

export default function OffersScreen() {
  const { data: offers, isLoading } = useReceivedOffers()
  const { mutateAsync: accept, isPending: accepting } = useAcceptOffer()
  const { mutateAsync: reject, isPending: rejecting } = useRejectOffer()

  function hoursLeft(expiresAt: string) {
    const h = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 3_600_000))
    return h
  }

  function handleAccept(offer: OfferWithDetails) {
    Alert.alert(
      'Aceptar oferta',
      `¿Confirmas que aceptas ${offer.budgetOffered} € de ${offer.team.clubName}? Se rechazarán el resto de ofertas para este slot.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Aceptar', onPress: () => accept(offer.id) },
      ]
    )
  }

  if (isLoading) return <View style={t.screen}><ActivityIndicator color={colors.accent} style={{ marginTop: 60 }} /></View>

  const pending = offers?.filter((o) => o.status === 'pending') ?? []

  return (
    <View style={t.screen}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Ofertas</Text>
        {pending.length > 0 && <View style={s.badge}><Text style={s.badgeText}>{pending.length}</Text></View>}
      </View>

      <FlatList
        data={offers}
        keyExtractor={(i) => i.id}
        contentContainerStyle={s.list}
        renderItem={({ item }) => {
          const isPending = item.status === 'pending'
          const h = hoursLeft(item.expiresAt)
          const urgent = h < 6
          return (
            <View style={isPending ? t.card : { ...t.card, opacity: 0.5 }}>
              <View style={s.offerHeader}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{item.team.clubName.slice(0, 2).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.eventName}>{item.eventName}</Text>
                  <Text style={s.teamName}>{item.team.clubName}</Text>
                </View>
                <Text style={s.amount}>{item.budgetOffered} €</Text>
              </View>

              <Text style={s.meta}>{item.deliverables?.photoCount ?? '?'} fotos · entrega {item.deliverables?.deliveryHours ?? '?'}h</Text>
              {item.message ? <Text style={s.message}>"{item.message}"</Text> : null}

              {isPending && (
                <>
                  <Text style={[s.expiry, urgent && s.expiryUrgent]}>
                    {urgent ? '⚠ ' : ''}Expira en {h}h
                  </Text>
                  <View style={s.actions}>
                    <TouchableOpacity style={s.btnReject} onPress={() => reject(item.id)} disabled={rejecting}>
                      <Text style={s.btnRejectText}>Rechazar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.btnAccept} onPress={() => handleAccept(item)} disabled={accepting}>
                      <Text style={s.btnAcceptText}>Aceptar · {item.budgetOffered} €</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {item.status === 'accepted' && (
                <View style={statusBadge('confirmed').badge}><Text style={statusBadge('confirmed').text}>Aceptada</Text></View>
              )}
              {item.status === 'rejected' && (
                <View style={statusBadge('completed').badge}><Text style={[statusBadge('completed').text, { color: colors.textMuted }]}>Rechazada</Text></View>
              )}
            </View>
          )
        }}
        ListEmptyComponent={<Text style={s.empty}>No has recibido ofertas todavía.</Text>}
      />
    </View>
  )
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontFamily: font.heading, fontSize: 24, color: colors.accent, letterSpacing: 2, textTransform: 'uppercase' },
  badge: { backgroundColor: colors.danger, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontFamily: font.heading, fontSize: 11, color: '#fff' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  offerHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#0d2030', borderWidth: 0.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: font.heading, fontSize: 11, color: colors.accent },
  eventName: { fontFamily: font.heading, fontSize: 13, color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: 0.5 },
  teamName: { fontFamily: font.body, fontSize: 11, color: colors.textSecondary },
  amount: { fontFamily: font.heading, fontSize: 18, color: colors.accent },
  meta: { fontFamily: font.body, fontSize: 11, color: colors.textSecondary, marginBottom: 3 },
  message: { fontFamily: font.body, fontSize: 11, color: colors.textMuted, fontStyle: 'italic', marginBottom: 3 },
  expiry: { fontFamily: font.label, fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 },
  expiryUrgent: { color: colors.danger },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  btnReject: { flex: 1, borderWidth: 0.5, borderColor: colors.danger, borderRadius: radius.sm, paddingVertical: 8, alignItems: 'center' },
  btnRejectText: { fontFamily: font.heading, fontSize: 11, color: colors.danger, textTransform: 'uppercase', letterSpacing: 0.6 },
  btnAccept: { flex: 2, backgroundColor: colors.accent, borderRadius: radius.sm, paddingVertical: 8, alignItems: 'center' },
  btnAcceptText: { fontFamily: font.heading, fontSize: 11, color: colors.bg, textTransform: 'uppercase', letterSpacing: 0.6 },
  empty: { fontFamily: font.body, fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 40 },
})
