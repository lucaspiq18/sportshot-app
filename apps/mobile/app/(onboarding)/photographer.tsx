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

export default function OnboardingPhotographerScreen() {
  const router = useRouter()
  const { user } = useUser()
  const { post } = useApi()
  const { setSession } = useSessionStore()

  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [city, setCity] = useState('')
  const [sports, setSports] = useState<string[]>([])
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)

  function toggleSport(sport: string) {
    setSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    )
  }

  async function handleSubmit() {
    if (!fullName.trim() || !city.trim() || sports.length === 0) {
      return Alert.alert('Faltan datos', 'Completa tu nombre, ciudad y al menos un deporte.')
    }
    setLoading(true)
    try {
      const result = await post<{ role: string; photographerId: string; userId: string }>(
        '/onboarding/photographer',
        { fullName: fullName.trim(), city: city.trim(), sports, bio: bio.trim() || undefined }
      )
      setSession({ role: 'photographer', userId: result.userId, photographerId: result.photographerId, teamId: null })
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

      <Text style={s.title}>Tu perfil de fotógrafo</Text>
      <Text style={s.subtitle}>Esta información aparecerá cuando los equipos te busquen.</Text>

      <Text style={t.inputLabel}>Nombre completo</Text>
      <TextInput style={t.input} value={fullName} onChangeText={setFullName} placeholder="Tu nombre y apellidos" placeholderTextColor={colors.textMuted} />

      <Text style={t.inputLabel}>Ciudad principal</Text>
      <TextInput style={t.input} value={city} onChangeText={setCity} placeholder="Madrid, Barcelona, Valencia..." placeholderTextColor={colors.textMuted} />

      <Text style={t.inputLabel}>Deportes que fotografías</Text>
      <View style={s.sportsGrid}>
        {SPORTS_OPTIONS.map((sport) => (
          <TouchableOpacity
            key={sport}
            style={[s.sportChip, sports.includes(sport) && s.sportChipActive]}
            onPress={() => toggleSport(sport)}
          >
            <Text style={[s.sportChipText, sports.includes(sport) && s.sportChipTextActive]}>{sport}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={t.inputLabel}>Sobre ti (opcional)</Text>
      <TextInput
        style={[t.input, s.textarea]}
        value={bio}
        onChangeText={setBio}
        multiline
        placeholder="Cuéntanos tu experiencia, estilo fotográfico, equipamiento..."
        placeholderTextColor={colors.textMuted}
        maxLength={300}
      />
      <Text style={s.charCount}>{bio.length}/300</Text>

      <TouchableOpacity
        style={[t.btnPrimary, (loading || sports.length === 0) && { opacity: 0.5 }]}
        onPress={handleSubmit}
        disabled={loading || sports.length === 0}
      >
        {loading ? <ActivityIndicator color={colors.bg} /> : <Text style={t.btnPrimaryText}>Crear perfil de fotógrafo</Text>}
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
  textarea: { height: 90, textAlignVertical: 'top', marginBottom: 4 },
  charCount: { fontFamily: font.label, fontSize: 9, color: colors.textMuted, textAlign: 'right', marginBottom: 24, textTransform: 'uppercase' },
})
