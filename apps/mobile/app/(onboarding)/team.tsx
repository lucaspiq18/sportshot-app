import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useUser } from '@clerk/clerk-expo'
import { useApi } from '../../src/api/client'
import { useSessionStore } from '../../src/store/session'
import { colors, font, radius, s as t } from '../../src/theme'

const SPORTS_OPTIONS = ['Fútbol', 'Baloncesto', 'Natación', 'Atletismo', 'Ciclismo', 'Tenis', 'Pádel', 'Rugby', 'Balonmano', 'Voleibol']

export default function OnboardingTeamScreen() {
  const router = useRouter()
  const { user } = useUser()
  const { post } = useApi()
  const { setSession } = useSessionStore()

  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [clubName, setClubName] = useState('')
  const [sport, setSport] = useState('')
  const [city, setCity] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!fullName.trim() || !clubName.trim() || !sport || !city.trim()) {
      return Alert.alert('Faltan datos', 'Completa tu nombre, club, deporte y ciudad.')
    }
    setLoading(true)
    try {
      const result = await post<{ role: string; teamId: string; userId: string }>(
        '/onboarding/team',
        { fullName: fullName.trim(), clubName: clubName.trim(), sport, city: city.trim(), category: category.trim() || undefined }
      )
      setSession({ role: 'team', userId: result.userId, photographerId: null, teamId: result.teamId })
      router.replace('/(tabs)')
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo completar el registro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={t.screen} contentContainerStyle={s.content}>
      <TouchableOpacity onPress={() => router.back()} style={s.back}>
        <Text style={s.backText}>‹ Cambiar rol</Text>
      </TouchableOpacity>

      <Text style={s.title}>Tu perfil de equipo</Text>
      <Text style={s.subtitle}>Los fotógrafos verán estos datos cuando les hagas una oferta.</Text>

      <Text style={t.inputLabel}>Tu nombre completo</Text>
      <TextInput style={t.input} value={fullName} onChangeText={setFullName} placeholder="Tu nombre y apellidos" placeholderTextColor={colors.textMuted} />

      <Text style={t.inputLabel}>Nombre del club o equipo</Text>
      <TextInput style={t.input} value={clubName} onChangeText={setClubName} placeholder="Club Deportivo Ejemplo" placeholderTextColor={colors.textMuted} />

      <Text style={t.inputLabel}>Deporte principal</Text>
      <View style={s.sportsGrid}>
        {SPORTS_OPTIONS.map((sp) => (
          <TouchableOpacity
            key={sp}
            style={[s.sportChip, sport === sp && s.sportChipActive]}
            onPress={() => setSport(sp)}
          >
            <Text style={[s.sportChipText, sport === sp && s.sportChipTextActive]}>{sp}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={t.inputLabel}>Ciudad</Text>
      <TextInput style={t.input} value={city} onChangeText={setCity} placeholder="Madrid, Barcelona, Valencia..." placeholderTextColor={colors.textMuted} />

      <Text style={t.inputLabel}>Categoría (opcional)</Text>
      <TextInput style={t.input} value={category} onChangeText={setCategory} placeholder="Sub-18, Primera División, Senior..." placeholderTextColor={colors.textMuted} />

      <TouchableOpacity
        style={[t.btnPrimary, (loading || !sport) && { opacity: 0.5 }]}
        onPress={handleSubmit}
        disabled={loading || !sport}
      >
        {loading ? <ActivityIndicator color={colors.bg} /> : <Text style={t.btnPrimaryText}>Crear perfil de equipo</Text>}
      </TouchableOpacity>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  content: { padding: 24, paddingBottom: 48 },
  back: { marginBottom: 24 },
  backText: { fontFamily: font.label, fontSize: 12, color: colors.accentDim, textTransform: 'uppercase', letterSpacing: 0.6 },
  title: { fontFamily: font.heading, fontSize: 26, color: colors.accent, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 },
  subtitle: { fontFamily: font.body, fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 28 },
  sportsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  sportChip: { borderWidth: 0.5, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 6 },
  sportChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  sportChipText: { fontFamily: font.label, fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  sportChipTextActive: { color: colors.bg },
})
