import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-expo'
import * as SecureStore from 'expo-secure-store'
import { Slot, useRouter, useSegments } from 'expo-router'
import { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { usePushNotifications } from '../src/hooks/usePushNotifications'
import { useFonts } from 'expo-font'
import {
  BarlowCondensed_400Regular,
  BarlowCondensed_500Medium,
  BarlowCondensed_600SemiBold,
  BarlowCondensed_700Bold,
} from '@expo-google-fonts/barlow-condensed'
import {
  Barlow_400Regular,
  Barlow_500Medium,
} from '@expo-google-fonts/barlow'
import { View, ActivityIndicator } from 'react-native'
import { colors } from '../src/theme'
import { useSessionStore } from '../src/store/session'
import { useApi } from '../src/api/client'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 30, retry: 1 } },
})

const tokenCache = {
  async getToken(key: string) { return SecureStore.getItemAsync(key) },
  async saveToken(key: string, value: string) { return SecureStore.setItemAsync(key, value) },
}

function AuthGuard() {
  const { isSignedIn, isLoaded } = useAuth()
  const { user } = useUser()
  const segments = useSegments()
  const router = useRouter()
  const { setSession, role } = useSessionStore()
  const { get } = useApi()
  const [checkingOnboarding, setCheckingOnboarding] = useState(false)

  usePushNotifications()

  useEffect(() => {
    if (!isLoaded) return

    const inAuth = segments[0] === '(auth)'
    const inOnboarding = segments[0] === '(onboarding)'

    if (!isSignedIn) {
      if (!inAuth) router.replace('/(auth)/login')
      return
    }

    // Usuario autenticado — verificar si completó el onboarding
    if (!inAuth && !inOnboarding && !role) {
      setCheckingOnboarding(true)
      get<{ completed: boolean; role: string | null; photographerId: string | null; teamId: string | null }>('/onboarding/status')
        .then((status) => {
          if (!status.completed) {
            router.replace('/(onboarding)/role')
          } else {
            setSession({
              role: status.role as any,
              userId: user?.id ?? '',
              photographerId: status.photographerId,
              teamId: status.teamId,
            })
            router.replace('/(tabs)')
          }
        })
        .catch(() => router.replace('/(onboarding)/role'))
        .finally(() => setCheckingOnboarding(false))
    }

    if (isSignedIn && inAuth) router.replace('/(tabs)')
  }, [isSignedIn, isLoaded, role])

  if (checkingOnboarding) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    )
  }

  return <Slot />
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    BarlowCondensed_400Regular,
    BarlowCondensed_500Medium,
    BarlowCondensed_600SemiBold,
    BarlowCondensed_700Bold,
    Barlow_400Regular,
    Barlow_500Medium,
  })

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />
  }

  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <QueryClientProvider client={queryClient}>
        <AuthGuard />
      </QueryClientProvider>
    </ClerkProvider>
  )
}
