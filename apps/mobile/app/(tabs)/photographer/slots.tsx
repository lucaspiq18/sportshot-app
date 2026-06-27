import { useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Modal, TextInput, Alert, ActivityIndicator,
} from 'react-native'
import { useMySlots, useCreateSlot, useDeleteSlot } from '../../../src/api/hooks'
import { colors, font, radius, s as t } from '../../../src/theme'

export default function SlotsScreen() {
  const { data: slots, isLoading } = useMySlots()
  const { mutateAsync: createSlot, isPending: creating } = useCreateSlot()
  const { mutateAsync: deleteSlot } = useDeleteSlot()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ sport: '', city: '', startsAt: '', endsAt: '' })

  async function handleCreate() {
    if (!form.sport || !form.city || !form.startsAt || !form.endsAt) {
      return Alert.alert('Faltan datos', 'Completa todos los campos')
    }
    await createSlot(form)
    setModal(false)
    setForm({ sport: '', city: '', startsAt: '', endsAt: '' })
  }

  if (isLoading) return <View style={t.screen}><ActivityIndicator color={colors.accent} style={{ marginTop: 60 }} /></View>

  return (
    <View style={t.screen}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Disponibilidad</Text>
        <TouchableOpacity style={s.fab} onPress={() => setModal(true)}>
          <Text style={s.fabText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={slots}
        keyExtractor={(i) => i.id}
        contentContainerStyle={s.list}
        renderItem={({ item }) => {
          const isBooked = item.status === 'booked'
          return (
            <View style={isBooked ? t.cardAccent : t.card}>
              <View style={s.cardTop}>
                <Text style={[s.sportTag, isBooked && s.sportTagBooked]}>{isBooked ? 'Reservado' : item.sport}</Text>
                {item.offers && item.offers.length > 0 && !isBooked && (
                  <View style={s.offersChip}>
                    <Text style={s.offersChipText}>{item.offers.filter((o: any) => o.status === 'pending').length} ofertas</Text>
                  </View>
                )}
                {!isBooked && (
                  <TouchableOpacity onPress={() => Alert.alert('Eliminar slot', '¿Seguro?', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Eliminar', style: 'destructive', onPress: () => deleteSlot(item.id) }])}>
                    <Text style={s.deleteBtn}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={s.cardTitle}>{new Date(item.startsAt).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })} · {new Date(item.startsAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}–{new Date(item.endsAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</Text>
              <Text style={s.cardMeta}>{item.city}</Text>
            </View>
          )
        }}
        ListEmptyComponent={<Text style={s.empty}>No tienes slots publicados. Pulsa + para crear uno.</Text>}
      />

      <Modal visible={modal} animationType="slide" presentationStyle="pageSheet">
        <View style={s.modal}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Nuevo slot</Text>
            <TouchableOpacity onPress={() => setModal(false)}>
              <Text style={s.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          {(['sport', 'city', 'startsAt', 'endsAt'] as const).map((field) => (
            <View key={field}>
              <Text style={t.inputLabel}>{field === 'startsAt' ? 'Inicio (ISO)' : field === 'endsAt' ? 'Fin (ISO)' : field === 'sport' ? 'Deporte' : 'Ciudad'}</Text>
              <TextInput
                style={t.input}
                value={form[field]}
                onChangeText={(v) => setForm((f) => ({ ...f, [field]: v }))}
                placeholder={field === 'startsAt' || field === 'endsAt' ? '2025-06-28T16:00:00' : ''}
                placeholderTextColor={colors.textMuted}
              />
            </View>
          ))}

          <TouchableOpacity style={t.btnPrimary} onPress={handleCreate} disabled={creating}>
            {creating ? <ActivityIndicator color={colors.bg} /> : <Text style={t.btnPrimaryText}>Publicar slot</Text>}
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  )
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontFamily: font.heading, fontSize: 24, color: colors.accent, letterSpacing: 2, textTransform: 'uppercase' },
  fab: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  fabText: { fontFamily: font.heading, fontSize: 22, color: colors.bg, lineHeight: 26 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  sportTag: { fontFamily: font.heading, fontSize: 10, color: colors.bg, backgroundColor: colors.accent, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.sm, letterSpacing: 0.6, textTransform: 'uppercase' },
  sportTagBooked: { backgroundColor: colors.accentDark },
  offersChip: { backgroundColor: '#0d2a1a', borderWidth: 0.5, borderColor: colors.success, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 2 },
  offersChipText: { fontFamily: font.label, fontSize: 9, color: colors.success, textTransform: 'uppercase', letterSpacing: 0.5 },
  deleteBtn: { marginLeft: 'auto', color: colors.textMuted, fontSize: 14 },
  cardTitle: { ...t.cardTitle },
  cardMeta: { ...t.meta, marginTop: 2 },
  empty: { fontFamily: font.body, fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 40, paddingHorizontal: 32 },
  modal: { flex: 1, backgroundColor: colors.bg, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontFamily: font.heading, fontSize: 22, color: colors.accent, letterSpacing: 1.5, textTransform: 'uppercase' },
  modalClose: { fontFamily: font.body, fontSize: 18, color: colors.textMuted },
})
