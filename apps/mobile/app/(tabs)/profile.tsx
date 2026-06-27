import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native'
import { useAuth, useUser } from '@clerk/clerk-expo'
import * as Notifications from 'expo-notifications'
import { useSessionStore } from '../../src/store/session'
import { useApi } from '../../src/api/client'
import { colors, font, radius, s as t } from '../../src/theme'
import { usePhotographerReviews } from '../../src/api/hooks'

const TIER_INFO: Record<string, { label: string; commission: number; next?: string; nextAt: number }> = {
  new:    { label: 'New',    commission: 15, next: 'Active', nextAt: 5 },
  active: { label: 'Active', commission: 12, next: 'Pro',    nextAt: 20 },
  pro:    { label: 'Pro',    commission: 8,  next: 'Elite',  nextAt: 50 },
  elite:  { label: 'Elite',  commission: 5,  nextAt: Infinity },
}

export default function ProfileScreen() {
  const { signOut } = useAuth()
  const { user } = useUser()
  const { role, clearSession } = useSessionStore()
  const { del } = useApi()
  const isPhotographer = role === 'photographer'

  const photographerId = useSessionStore((s) => s.photographerId)
  const { data: reviewData, isLoading: loadingReviews } = usePhotographerReviews(photographerId ?? '')
  const tier = TIER_INFO['active']
  const initials = (user?.fullName ?? user?.emailAddresses?.[0]?.emailAddress ?? 'U')
    .split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  async function handleSignOut() {
    try {
      const { data: tokenData } = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
      })
      await del(`/push-tokens/${encodeURIComponent(tokenData)}`).catch(() => {})
    } catch {}
    clearSession()
    await signOut()
  }

  return (
    <ScrollView style={t.screen} contentContainerStyle={s.content}>
      <View style={s.avatarBlock}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{initials}</Text>
        </View>
        <Text style={s.name}>{user?.fullName ?? user?.emailAddresses?.[0]?.emailAddress}</Text>
        <Text style={s.roleBadgeText}>{isPhotographer ? 'Fotógrafo deportivo' : 'Equipo / Club'}</Text>
      </View>

      {isPhotographer && (
        <View style={s.tierCard}>
          <View style={s.tierRow}>
            <View>
              <Text style={s.tierLabel}>Tier actual</Text>
              <Text style={s.tierName}>{tier.label}</Text>
            </View>
            <View style={s.tierRight}>
              <Text style={s.commissionLabel}>Comisión</Text>
              <Text style={s.commissionValue}>{tier.commission}%</Text>
            </View>
          </View>
          {tier.next && (
            <View style={s.tierProgress}>
              <Text style={s.tierProgressText}>
                Próximo tier: <Text style={{ color: colors.accent }}>{tier.next}</Text> — completa {tier.nextAt} trabajos
              </Text>
            </View>
          )}
        </View>
      )}

      {isPhotographer && (
        <View style={s.statsRow}>
          <StatBox label="Trabajos" value="23" />
          <StatBox label="Valoración" value={reviewData?.summary ? parseFloat(reviewData.summary.ratingAvg).toFixed(1) : '—'} />
          <StatBox label="Reseñas" value={String(reviewData?.summary?.ratingCount ?? 0)} />
        </View>
      )}

      {isPhotographer && (
        <View style={s.reviewsSection}>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Valoraciones</Text>
            {reviewData?.summary && (
              <View style={s.ratingBig}>
                <Text style={s.ratingBigNum}>{'★'.repeat(Math.round(parseFloat(reviewData.summary.ratingAvg)))}</Text>
              </View>
            )}
          </View>
          {loadingReviews ? (
            <ActivityIndicator color={colors.accent} style={{ marginTop: 12 }} />
          ) : reviewData?.reviews.length === 0 ? (
            <Text style={s.emptyReviews}>Aún no tienes valoraciones. Completa tu primer trabajo para empezar a recibirlas.</Text>
          ) : (
            reviewData?.reviews.slice(0, 5).map((review) => (
              <View key={review.id} style={s.reviewCard}>
                <View style={s.reviewHeader}>
                  <Text style={s.reviewerName}>{review.reviewer.fullName}</Text>
                  <Text style={s.reviewStars}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</Text>
                </View>
                <Text style={s.reviewEvent}>{review.booking.offer.eventName}</Text>
                {review.comment ? <Text style={s.reviewComment}>"{review.comment}"</Text> : null}
              </View>
            ))
          )}
        </View>
      )}

      <View style={s.section}>
        <MenuItem icon="🔔" label="Notificaciones" />
        <MenuItem icon="🔒" label="Privacidad" />
        <MenuItem icon="❓" label="Ayuda y soporte" />
        <MenuItem icon="📄" label="Términos y condiciones" />
      </View>

      <TouchableOpacity style={s.logoutBtn} onPress={() => Alert.alert('Cerrar sesión', '¿Seguro?', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Cerrar sesión', style: 'destructive', onPress: handleSignOut }])}>
        <Text style={s.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

      <Text style={s.version}>SportShot v0.1.0</Text>
    </ScrollView>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.statBox}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  )
}

function MenuItem({ icon, label }: { icon: string; label: string }) {
  return (
    <TouchableOpacity style={s.menuItem}>
      <Text style={s.menuIcon}>{icon}</Text>
      <Text style={s.menuLabel}>{label}</Text>
      <Text style={s.menuArrow}>›</Text>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  content: { paddingBottom: 48 },
  avatarBlock: { alignItems: 'center', paddingTop: 32, paddingBottom: 24 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#0d2030', borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontFamily: font.heading, fontSize: 26, color: colors.accent, letterSpacing: 1 },
  name: { fontFamily: font.heading, fontSize: 20, color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  roleBadgeText: { fontFamily: font.label, fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },

  tierCard: { marginHorizontal: 16, marginBottom: 12, backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 0.5, borderColor: colors.border, padding: 14 },
  tierRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  tierLabel: { fontFamily: font.label, fontSize: 9, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 },
  tierName: { fontFamily: font.heading, fontSize: 22, color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: 1 },
  tierRight: { alignItems: 'flex-end' },
  commissionLabel: { fontFamily: font.label, fontSize: 9, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 },
  commissionValue: { fontFamily: font.heading, fontSize: 28, color: colors.accent },
  tierProgress: { borderTopWidth: 0.5, borderTopColor: colors.border, paddingTop: 10 },
  tierProgressText: { fontFamily: font.body, fontSize: 12, color: colors.textSecondary },

  statsRow: { flexDirection: 'row', gap: 8, marginHorizontal: 16, marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: colors.card, borderRadius: radius.sm, borderWidth: 0.5, borderColor: colors.border, padding: 10, alignItems: 'center' },
  statValue: { fontFamily: font.heading, fontSize: 18, color: colors.accent, marginBottom: 2 },
  statLabel: { fontFamily: font.label, fontSize: 9, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },

  section: { marginHorizontal: 16, borderRadius: radius.md, borderWidth: 0.5, borderColor: colors.border, overflow: 'hidden', marginBottom: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  menuIcon: { fontSize: 16 },
  menuLabel: { fontFamily: font.heading, fontSize: 13, color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: 0.6, flex: 1 },
  menuArrow: { fontFamily: font.body, fontSize: 18, color: colors.textMuted },

  logoutBtn: { marginHorizontal: 16, borderWidth: 0.5, borderColor: colors.danger, borderRadius: radius.sm, paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  logoutText: { fontFamily: font.heading, fontSize: 14, color: colors.danger, textTransform: 'uppercase', letterSpacing: 1 },

  version: { fontFamily: font.body, fontSize: 11, color: colors.textMuted, textAlign: 'center' },

  reviewsSection: { marginHorizontal: 16, marginBottom: 20 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontFamily: font.heading, fontSize: 14, color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: 0.8 },
  ratingBig: {},
  ratingBigNum: { fontSize: 14, color: '#EF9F27', letterSpacing: 2 },
  emptyReviews: { fontFamily: font.body, fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  reviewCard: { backgroundColor: colors.card, borderRadius: radius.sm, borderWidth: 0.5, borderColor: colors.border, padding: 10, marginBottom: 8 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  reviewerName: { fontFamily: font.heading, fontSize: 12, color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: 0.5 },
  reviewStars: { fontSize: 12, color: '#EF9F27', letterSpacing: 1 },
  reviewEvent: { fontFamily: font.label, fontSize: 9, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  reviewComment: { fontFamily: font.body, fontSize: 12, color: colors.textSecondary, fontStyle: 'italic', lineHeight: 18 },
})
