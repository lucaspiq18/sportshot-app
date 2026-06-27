import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { usePhotographerProfile } from '../../../src/api/hooks'
import { colors, font, radius, s as t, sportTag } from '../../../src/theme'

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  const full = Math.round(rating)
  return (
    <Text style={{ fontSize: size, color: '#EF9F27', letterSpacing: 1.5 }}>
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
    </Text>
  )
}

export default function PhotographerProfileScreen() {
  const { photographerId } = useLocalSearchParams<{ photographerId: string }>()
  const router = useRouter()
  const { data: profile, isLoading } = usePhotographerProfile(photographerId ?? '')

  if (isLoading) {
    return (
      <View style={[t.screen, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    )
  }

  if (!profile) {
    return (
      <View style={[t.screen, { alignItems: 'center', justifyContent: 'center', padding: 24 }]}>
        <Text style={t.empty}>Fotógrafo no encontrado</Text>
      </View>
    )
  }

  return (
    <ScrollView style={t.screen} contentContainerStyle={s.content}>

      {/* Header */}
      <View style={s.header}>
        <View style={s.avatar}>
          <Text style={s.avatarInitial}>{profile.fullName?.[0] ?? '?'}</Text>
        </View>
        <View style={s.headerInfo}>
          <Text style={s.name}>{profile.fullName}</Text>
          <Text style={s.city}>📍 {profile.city}</Text>
          {profile.ratingAvg > 0 && (
            <View style={s.ratingRow}>
              <Stars rating={profile.ratingAvg} />
              <Text style={s.ratingNum}> {parseFloat(profile.ratingAvg).toFixed(1)}</Text>
              <Text style={s.ratingCount}> ({profile.ratingCount} trabajos)</Text>
            </View>
          )}
        </View>
      </View>

      {/* Deportes */}
      <View style={s.tagsRow}>
        {profile.sports?.map((sp: string) => (
          <View key={sp} style={sportTag().badge}>
            <Text style={sportTag().text}>{sp}</Text>
          </View>
        ))}
      </View>

      {/* Bio */}
      {profile.bio ? (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Sobre el fotógrafo</Text>
          <Text style={s.bio}>{profile.bio}</Text>
        </View>
      ) : null}

      {/* Stats */}
      <View style={s.statsRow}>
        <View style={s.statBox}>
          <Text style={s.statValue}>{profile.completedJobs}</Text>
          <Text style={s.statLabel}>Trabajos</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statBox}>
          <Text style={s.statValue}>{profile.ratingAvg > 0 ? parseFloat(profile.ratingAvg).toFixed(1) : '—'}</Text>
          <Text style={s.statLabel}>Valoración</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statBox}>
          <Text style={s.statValue}>{profile.slots?.length ?? 0}</Text>
          <Text style={s.statLabel}>Slots libres</Text>
        </View>
      </View>

      {/* Slots disponibles */}
      {profile.slots?.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Disponibilidad próxima</Text>
          {profile.slots.map((slot: any) => {
            const date = new Date(slot.startsAt)
            return (
              <TouchableOpacity
                key={slot.id}
                style={s.slotCard}
                onPress={() => router.push({ pathname: '/(tabs)/team/offer', params: { slotId: slot.id, photographerName: profile.fullName, eventCity: slot.city } })}
              >
                <View style={s.slotLeft}>
                  <Text style={s.slotDate}>
                    {date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </Text>
                  <Text style={s.slotTime}>
                    {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} · {slot.city}
                  </Text>
                  <View style={s.slotSports}>
                    {slot.sports?.slice(0, 3).map((sp: string) => (
                      <View key={sp} style={sportTag('sm').badge}>
                        <Text style={sportTag('sm').text}>{sp}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View style={s.slotRight}>
                  <Text style={s.slotPrice}>{slot.price} €</Text>
                  <View style={s.offerBtn}>
                    <Text style={s.offerBtnText}>Ofertar</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
      )}

      {/* Reseñas */}
      {profile.reviews?.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Últimas valoraciones</Text>
          {profile.reviews.map((review: any) => (
            <View key={review.id} style={s.reviewCard}>
              <View style={s.reviewHeader}>
                <Text style={s.reviewerName}>{review.reviewer.fullName}</Text>
                <Stars rating={review.rating} size={12} />
              </View>
              <Text style={s.reviewEvent}>{review.booking.offer.eventName}</Text>
              {review.comment ? <Text style={s.reviewComment}>"{review.comment}"</Text> : null}
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  )
}

const s = StyleSheet.create({
  content: { padding: 20 },
  header: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.accentDark, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.accent },
  avatarInitial: { fontFamily: font.heading, fontSize: 28, color: colors.accent },
  headerInfo: { flex: 1, justifyContent: 'center', gap: 4 },
  name: { fontFamily: font.heading, fontSize: 22, color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: 1 },
  city: { fontFamily: font.body, fontSize: 12, color: colors.textSecondary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  ratingNum: { fontFamily: font.heading, fontSize: 13, color: '#EF9F27' },
  ratingCount: { fontFamily: font.body, fontSize: 11, color: colors.textMuted },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontFamily: font.heading, fontSize: 13, color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  bio: { fontFamily: font.body, fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  statsRow: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 0.5, borderColor: colors.border, marginBottom: 24, overflow: 'hidden' },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statValue: { fontFamily: font.heading, fontSize: 22, color: colors.accent, letterSpacing: 0.5 },
  statLabel: { fontFamily: font.label, fontSize: 9, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  statDivider: { width: 0.5, backgroundColor: colors.border },
  slotCard: { backgroundColor: colors.card, borderRadius: radius.sm, borderWidth: 0.5, borderColor: colors.border, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  slotLeft: { flex: 1 },
  slotDate: { fontFamily: font.heading, fontSize: 13, color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  slotTime: { fontFamily: font.body, fontSize: 11, color: colors.textSecondary, marginBottom: 6 },
  slotSports: { flexDirection: 'row', gap: 4 },
  slotRight: { alignItems: 'flex-end', gap: 6 },
  slotPrice: { fontFamily: font.heading, fontSize: 18, color: colors.accent },
  offerBtn: { backgroundColor: colors.accent, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 4 },
  offerBtnText: { fontFamily: font.label, fontSize: 10, color: colors.bg, textTransform: 'uppercase', letterSpacing: 0.6 },
  reviewCard: { backgroundColor: colors.card, borderRadius: radius.sm, borderWidth: 0.5, borderColor: colors.border, padding: 10, marginBottom: 8 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  reviewerName: { fontFamily: font.heading, fontSize: 11, color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: 0.5 },
  reviewEvent: { fontFamily: font.label, fontSize: 9, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 },
  reviewComment: { fontFamily: font.body, fontSize: 12, color: colors.textSecondary, fontStyle: 'italic', lineHeight: 18 },
})
