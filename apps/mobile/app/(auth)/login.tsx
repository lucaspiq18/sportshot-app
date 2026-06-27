import { useSignIn, useSignUp } from '@clerk/clerk-expo'
import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native'
import { colors, font, radius, s as t } from '../../src/theme'

export default function LoginScreen() {
  const { signIn, setActive: setSignInActive, isLoaded: signInLoaded } = useSignIn()
  const { signUp, setActive: setSignUpActive, isLoaded: signUpLoaded } = useSignUp()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!signInLoaded) return
    setLoading(true)
    try {
      const result = await signIn.create({ identifier: email, password })
      await setSignInActive({ session: result.createdSessionId })
    } catch (e: any) {
      Alert.alert('Error', e.errors?.[0]?.message ?? 'No se pudo iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister() {
    if (!signUpLoaded) return
    setLoading(true)
    try {
      const result = await signUp.create({ emailAddress: email, password })
      await setSignUpActive({ session: result.createdSessionId })
    } catch (e: any) {
      Alert.alert('Error', e.errors?.[0]?.message ?? 'No se pudo crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={t.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.container}>
        <View style={s.logoBlock}>
          <Text style={s.logo}>SPORT</Text>
          <Text style={s.logoAccent}>SHOT</Text>
          <Text style={s.tagline}>El mercado de la fotografía deportiva</Text>
        </View>

        <View style={s.form}>
          <Text style={t.inputLabel}>Email</Text>
          <TextInput
            style={t.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="tu@email.com"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={t.inputLabel}>Contraseña</Text>
          <TextInput
            style={t.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
          />

          <TouchableOpacity
            style={[t.btnPrimary, { marginTop: 8 }]}
            onPress={mode === 'login' ? handleLogin : handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.bg} />
            ) : (
              <Text style={t.btnPrimaryText}>{mode === 'login' ? 'Entrar' : 'Crear cuenta'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={{ marginTop: 16, alignItems: 'center' }} onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
            <Text style={s.toggle}>
              {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Entra aquí'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  logoBlock: { alignItems: 'center', marginBottom: 48 },
  logo: { fontFamily: font.heading, fontSize: 48, color: colors.textPrimary, letterSpacing: 6, lineHeight: 52 },
  logoAccent: { fontFamily: font.heading, fontSize: 48, color: colors.accent, letterSpacing: 6, lineHeight: 52 },
  tagline: { fontFamily: font.body, fontSize: 13, color: colors.textSecondary, marginTop: 8, textAlign: 'center' },
  form: { gap: 0 },
  toggle: { fontFamily: font.label, fontSize: 11, color: colors.accentDim, letterSpacing: 0.5, textTransform: 'uppercase' },
})
