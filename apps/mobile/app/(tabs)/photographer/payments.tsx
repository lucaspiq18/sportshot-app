import { useEffect } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import { useQueryClient } from '@tanstack/react-query'
import { useConnectStatus, useStartOnboarding } from '../../../src/api/hooks'
import { colors, font, radius, s as t } from '../../../src/theme'

export default function PaymentsScreen() {
  const qc = useQueryClient()
  const { data: status, isLoading, refetch } = useConnectStatus()
  const { mutateAsync: startOnboarding, isPending } = useStartOnboarding()

  useEffect(() => {
    const sub = Linking.addEventListener('url', ({ url }) => {
      if (url.includes('connect/')) {
        WebBrowser.dismissBrowser()
        refetch()
        qc.invalidateQueries({ queryKey: ['connect-status'] })
      }
    })
    return () => sub.remove()
  }, [])

  async function handleOnboarding() {
    try {
      const { url } = await startOnboarding()
      await WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
        controlsColor: colors.accent,
      })
      await refetch()
    } catch (e: any) {
      Alert.alert('Error', e.message)
    }
  }

  if (isLoading) return (
    <View style={t.screen}>
      <ActivityIndicator color={colors.accent} style={{ marginTop: 60 }} />
    </View>
  )

  return (
    <ScrollView style={t.screen} contentContainerStyle={s.content}>
      {status?.onboarded ? (
        <OnboardedView status={status} />
      ) : (
        <PendingView
          hasAccount={status?.hasAccount ?? false}
          requirements={status?.requirements ?? []}
          onPress={handleOnboarding}
          loading={isPending}
        />
      )}
    </ScrollView>
  )
}

function OnboardedView({ status }: { status: { chargesEnabled: boolean; payoutsEnabled: boolean } }) {
  return (
    <View style={s.inner}>
      <View style={s.iconBlock}>
        <Text style={s.iconText}>✓</Text>
      </View>
      <Text style={s.title}>Cuenta activa</Text>
      <Text style={s.subtitle}>Ya puedes aceptar ofertas y recibir transferencias directamente en tu cuenta bancaria.</Text>

      <View style={s.statusGrid}>
        <StatusItem label="Cobrar pagos" ok={status.chargesEnabled} />
        <StatusItem label="Transferencias" ok={status.payoutsEnabled} />
      </View>

      <View style={s.infoBox}>
        <Text style={s.infoText}>
          Las transferencias llegan en 2–5 días hábiles tras la aprobación. La comisión se descuenta automáticamente.
        </Text>
      </View>
    </View>
  )
}

function PendingView({ hasAccount, requirements, onPress, loading }: {
  hasAccount: boolean; requirements: string[]; onPress: () => void; loading: boolean
}) {
  return (
    <View style={s.inner}>
      <View style={[s.iconBlock, { backgroundColor: colors.infoBg, borderColor: colors.infoBorder }]}>
        <Text style={[s.iconText, { color: colors.accent }]}>🏦</Text>
      </View>
      <Text style={s.title}>{hasAccount ? 'Completa tu cuenta' : 'Activa los pagos'}</Text>
      <Text style={s.subtitle}>
        {hasAccount
          ? 'Hay pasos pendientes en tu cuenta de Stripe. Completa el proceso para aceptar ofertas.'
          : 'Vincula una cuenta bancaria para cobrar tus servicios. Menos de 5 minutos.'}
      </Text>

      {requirements.length > 0 && (
        <View style={s.requirementsBox}>
          <Text style={s.requirementsTitle}>Pendiente de verificar</Text>
          {requirements.slice(0, 4).map((req) => (
            <Text key={req} style={s.requirementItem}>· {formatRequirement(req)}</Text>
          ))}
        </View>
      )}

      <View style={s.stepsBox}>
        {[
          'Datos personales (nombre, fecha de nacimiento)',
          'Documento de identidad (DNI o pasaporte)',
          'Cuenta bancaria para recibir transferencias',
        ].map((text, i) => (
          <View key={i} style={s.step}>
            <View style={s.stepNum}><Text style={s.stepNumText}>{i + 1}</Text></View>
            <Text style={s.stepText}>{text}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={t.btnPrimary} onPress={onPress} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.bg} />
        ) : (
          <Text style={t.btnPrimaryText}>{hasAccount ? 'Continuar proceso' : 'Activar cuenta de pagos'}</Text>
        )}
      </TouchableOpacity>

      <Text style={s.legalNote}>
        La verificación está gestionada por Stripe. SportShot nunca accede a tus datos bancarios.
      </Text>
    </View>
  )
}

function StatusItem({ label, ok }: { label: string; ok: boolean }) {
  return (
    <View style={[s.statusItem, ok ? s.statusOk : s.statusPending]}>
      <Text style={[s.statusIcon, ok ? s.statusIconOk : s.statusIconPending]}>{ok ? '✓' : '·'}</Text>
      <Text style={[s.statusLabel, ok ? s.statusLabelOk : s.statusLabelPending]}>{label}</Text>
    </View>
  )
}

function formatRequirement(req: string): string {
  const labels: Record<string, string> = {
    'individual.id_number': 'Número de identificación',
    'individual.verification.document': 'Documento de identidad',
    'individual.dob.day': 'Fecha de nacimiento',
    'external_account': 'Cuenta bancaria',
    'tos_acceptance.date': 'Aceptar términos de servicio',
  }
  return labels[req] ?? req.replace(/_/g, ' ')
}

const s = StyleSheet.create({
  content: { paddingBottom: 48 },
  inner: { padding: 24 },
  iconBlock: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#0d2a1a', borderWidth: 1, borderColor: colors.successBorder, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16, marginTop: 16 },
  iconText: { fontSize: 26, color: colors.success },
  title: { fontFamily: font.heading, fontSize: 24, color: colors.textPrimary, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
  subtitle: { fontFamily: font.body, fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  statusGrid: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statusItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: radius.sm, padding: 12, borderWidth: 0.5 },
  statusOk: { backgroundColor: '#0d2a1a', borderColor: colors.successBorder },
  statusPending: { backgroundColor: colors.card, borderColor: colors.border },
  statusIcon: { fontSize: 14 },
  statusIconOk: { color: colors.success },
  statusIconPending: { color: colors.textMuted },
  statusLabel: { fontFamily: font.label, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, flex: 1 },
  statusLabelOk: { color: colors.success },
  statusLabelPending: { color: colors.textMuted },
  infoBox: { backgroundColor: colors.card, borderRadius: radius.sm, padding: 14, borderWidth: 0.5, borderColor: colors.border },
  infoText: { fontFamily: font.body, fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  requirementsBox: { backgroundColor: colors.warningBg, borderRadius: radius.sm, padding: 14, marginBottom: 20, borderWidth: 0.5, borderColor: colors.warningBorder },
  requirementsTitle: { fontFamily: font.heading, fontSize: 12, color: colors.warning, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 },
  requirementItem: { fontFamily: font.body, fontSize: 13, color: colors.warning, marginBottom: 2 },
  stepsBox: { gap: 12, marginBottom: 28 },
  step: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.card, borderWidth: 0.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepNumText: { fontFamily: font.heading, fontSize: 12, color: colors.accent },
  stepText: { fontFamily: font.body, fontSize: 13, color: colors.textSecondary, flex: 1, lineHeight: 20 },
  legalNote: { fontFamily: font.body, fontSize: 11, color: colors.textMuted, textAlign: 'center', lineHeight: 17, marginTop: 16 },
})
