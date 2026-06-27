import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { colors, font, radius, s as t } from '../../src/theme'

export default function RoleScreen() {
  const router = useRouter()

  return (
    <View style={[t.screen, s.container]}>
      <View style={s.top}>
        <Text style={s.logo}>SPORT</Text>
        <Text style={s.logoAccent}>SHOT</Text>
        <Text style={s.tagline}>¿Cómo quieres usar SportShot?</Text>
      </View>

      <View style={s.cards}>
        <TouchableOpacity style={s.card} onPress={() => router.push('/(onboarding)/photographer')}>
          <Text style={s.cardIcon}>📷</Text>
          <Text style={s.cardTitle}>Soy fotógrafo</Text>
          <Text style={s.cardDesc}>Publica tu disponibilidad y recibe ofertas de equipos y deportistas.</Text>
          <View style={s.cardTag}><Text style={s.cardTagText}>Para fotógrafos</Text></View>
        </TouchableOpacity>

        <TouchableOpacity style={s.card} onPress={() => router.push('/(onboarding)/team')}>
          <Text style={s.cardIcon}>🏆</Text>
          <Text style={s.cardTitle}>Soy equipo / club</Text>
          <Text style={s.cardDesc}>Encuentra fotógrafos disponibles y haz ofertas para cubrir tus eventos.</Text>
          <View style={[s.cardTag, { backgroundColor: '#0d1a2a', borderColor: colors.accentDark }]}>
            <Text style={[s.cardTagText, { color: colors.accent }]}>Para equipos</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Text style={s.note}>No podrás cambiar el rol después del registro.</Text>
    </View>
  )
}

const s = StyleSheet.create({
  container: { padding: 24, justifyContent: 'space-between' },
  top: { alignItems: 'center', paddingTop: 48 },
  logo: { fontFamily: font.heading, fontSize: 42, color: colors.textPrimary, letterSpacing: 5, lineHeight: 46 },
  logoAccent: { fontFamily: font.heading, fontSize: 42, color: colors.accent, letterSpacing: 5, lineHeight: 46, marginBottom: 20 },
  tagline: { fontFamily: font.body, fontSize: 15, color: colors.textSecondary, textAlign: 'center' },
  cards: { gap: 14 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 0.5, borderColor: colors.border, padding: 20 },
  cardIcon: { fontSize: 32, marginBottom: 10 },
  cardTitle: { fontFamily: font.heading, fontSize: 20, color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  cardDesc: { fontFamily: font.body, fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 12 },
  cardTag: { backgroundColor: '#0d2a1a', borderWidth: 0.5, borderColor: colors.successBorder, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
  cardTagText: { fontFamily: font.label, fontSize: 10, color: colors.success, textTransform: 'uppercase', letterSpacing: 0.6 },
  note: { fontFamily: font.body, fontSize: 12, color: colors.textMuted, textAlign: 'center', paddingBottom: 16 },
})
