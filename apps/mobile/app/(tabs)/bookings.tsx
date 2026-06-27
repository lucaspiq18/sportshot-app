import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, TouchableOpacity,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useBookings } from '../../src/api/hooks'
import { useSessionStore } from '../../src/store/session'
import { colors, font, radius, s as t, statusBadge } from '../../src/theme'
import type { BookingWithDetails } from '@sportshot/types'

export default function BookingsScreen() {
  const { data: bookings, isLoading, refetch, isRefetching } = useBookings()
  const role = useSessionStore((s) => s.role)
  const router = useRouter()

  if (isLoading) return (
    <View style={t.screen}>
      <ActivityIndicator color={colors.accent} style={{ marginTop: 60 }} />
    </View>
  )

  return (
    <View style={t.screen}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Reservas</Text>
      </View>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        onRefresh={refetch}
        refreshing={isRefetching}
        ListEmptyComponent={<Text style={s.empty}>No tienes reservas todavía.</Text>}
        renderItem={({ item }) => (
          <BookingCard booking={item} role={role} router={router} />
        )}
      />
    </View>
  )
}

function BookingCard({
  booking,
  role,
  router,
}: {
  booking: BookingWithDetails
  role: string | null
  router: ReturnType<typeof useRouter>
}) {
  const eventDate = new Date(booking.slot.startsAt)
  const price = (booking.agreedPrice / 100).toFixed(0)
  const statusKey = booking.status as 'confirmed' | 'completed' | 'pending'
  const badge = statusBadge(statusKey === 'confirmed' ? 'confirmed' : statusKey === 'completed' ? 'completed' : 'pending')

  const STATUS_LABEL: Record<string, string> = {
    confirmed: 'Confirmada',
    completed: 'Completada',
    cancelled: 'Cancelada',
    disputed: 'En disputa',
  }

  const hasDelivery = !!(booking as any).delivery
  const canDeliver = role === 'photographer' && statusKey === 'confirmed' && !hasDelivery
  const canReview = role === 'team' && hasDelivery && statusKey === 'confirmed'

  return (
    <View style={t.card}>
      <View style={s.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={s.eventName}>{booking.offer.eventName}</Text>
          <Text style={s.date}>
            {eventDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })} · {booking.slot.city}
          </Text>
        </View>
        <View style={badge.badge}>
          <Text style={badge.text}>{STATUS_LABEL[booking.status] ?? booking.status}</Text>
        </View>
      </View>

      <View style={s.divider} />

      <View style={s.infoRow}>
        <View style={s.infoItem}>
          <Text style={s.infoLabel}>{role === 'photographer' ? 'Equipo' : 'Fotógrafo'}</Text>
          <Text style={s.infoValue}>
            {role === 'photographer'
              ? (booking as any).team?.clubName ?? '—'
              : (booking as any).photographer?.user?.name ?? '—'}
          </Text>
        </View>
        <View style={s.infoItem}>
          <Text style={s.infoLabel}>Precio</Text>
          <Text style={[s.infoValue, { color: colors.accent }]}>{price} €</Text>
        </View>
        <View style={s.infoItem}>
          <Text style={s.infoLabel}>Sport</Text>
          <Text style={s.infoValue}>{booking.slot.sport}</Text>
        </View>
      </View>

      {canDeliver && (
        <TouchableOpacity
          style={[t.btnPrimary, { marginTop: 12 }]}
          onPress={() => router.push({ pathname: '/(tabs)/photographer/deliver', params: { bookingId: booking.id, eventName: booking.offer.eventName } })}
        >
          <Text style={t.btnPrimaryText}>Entregar material</Text>
        </TouchableOpacity>
      )}

      {canReview && (
        <TouchableOpacity
          style={[t.btnPrimary, { marginTop: 12 }]}
          onPress={() => router.push({ pathname: '/(tabs)/team/review', params: { bookingId: booking.id, eventName: booking.offer.eventName, photoCount: String((booking as any).delivery?.photoCount ?? 0) } })}
        >
          <Text style={t.btnPrimaryText}>Ver y aprobar fotos</Text>
        </TouchableOpacity>
      )}

      {role === 'team' && statusKey === 'completed' && !(booking as any).review && (
        <TouchableOpacity
          style={[t.btnOutline, { marginTop: 12 }]}
          onPress={() => router.push({ pathname: '/(tabs)/team/review-submit', params: { bookingId: booking.id, photographerName: (booking as any).photographer?.user?.name ?? '', eventName: booking.offer.eventName } })}
        >
          <Text style={t.btnOutlineText}>Dejar valoración</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontFamily: font.heading, fontSize: 24, color: colors.accent, letterSpacing: 2, textTransform: 'uppercase' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  empty: { fontFamily: font.body, fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 60 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  eventName: { fontFamily: font.heading, fontSize: 15, color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 },
  date: { fontFamily: font.body, fontSize: 12, color: colors.textSecondary },
  divider: { height: 0.5, backgroundColor: colors.border, marginBottom: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoItem: { alignItems: 'center', flex: 1 },
  infoLabel: { fontFamily: font.label, fontSize: 9, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 },
  infoValue: { fontFamily: font.heading, fontSize: 13, color: colors.textPrimary },
})
