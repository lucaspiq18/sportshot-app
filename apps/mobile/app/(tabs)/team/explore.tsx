import { useState } from 'react'
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSlots } from '../../../src/api/hooks'
import { colors, font, radius, s as t } from '../../../src/theme'

const SPORTS = ['Todos', 'Fútbol', 'Baloncesto', 'Natación', 'Atletismo', 'Ciclismo']

export default function ExploreScreen() {
  const [city, setCity] = useState('')
  const [sport, setSport] = useState('Todos')
  const router = useRouter()
  const { data, isLoading } = useSlots({ city, sport: sport === 'Todos' ? undefined : sport })

  return (
    <View style={t.screen}>
      <View style={s.header}>
        <Text style={s.headerTitle}>SportShot</Text>
      </View>

      <View style={s.searchRow}>
        <TextInput
          style={s.searchInput}
          placeholder="Ciudad..."
          placeholderTextColor={colors.textMuted}
          value={city}
          onChangeText={setCity}
        />
      </View>

      <FlatList
        horizontal
        data={SPORTS}
        keyExtractor={(i) => i}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.chips}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.chip, item === sport && s.chipActive]}
            onPress={() => setSport(item)}
          >
            <Text style={[s.chipText, item === sport && s.chipTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(i) => i.id}
          contentContainerStyle={s.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.card}
              onPress={() => router.push({ pathname: '/(tabs)/team/photographer-profile', params: { photographerId: item.photographer.id } })}
            >
              <View style={s.cardTop}>
                <Text style={s.sportTag}>{item.sport}</Text>
                <Text style={s.offerLabel}>Hacer oferta</Text>
              </View>
              <Text style={s.cardTitle}>{item.photographer.user.name}</Text>
              <Text style={s.cardMeta}>{new Date(item.startsAt).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })} · {new Date(item.startsAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}–{new Date(item.endsAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</Text>
              <Text style={s.cardMeta}>{item.city}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={s.empty}>No hay fotógrafos disponibles en esta zona.</Text>}
        />
      )}
    </View>
  )
}

const s = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontFamily: font.heading, fontSize: 24, color: colors.accent, letterSpacing: 2, textTransform: 'uppercase' },
  searchRow: { paddingHorizontal: 16, marginBottom: 8 },
  searchInput: { ...t.input, marginBottom: 0 },
  chips: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  chip: { borderWidth: 0.5, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 5 },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontFamily: font.label, fontSize: 11, color: colors.textMuted, letterSpacing: 0.6, textTransform: 'uppercase' },
  chipTextActive: { color: colors.bg },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: { ...t.card },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  sportTag: { fontFamily: font.heading, fontSize: 10, color: colors.bg, backgroundColor: colors.accent, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.sm, letterSpacing: 0.6, textTransform: 'uppercase' },
  offerLabel: { fontFamily: font.label, fontSize: 10, color: colors.textSecondary, letterSpacing: 0.4, textTransform: 'uppercase' },
  cardTitle: { ...t.cardTitle },
  cardMeta: { ...t.meta, marginTop: 2 },
  empty: { fontFamily: font.body, fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 40 },
})
