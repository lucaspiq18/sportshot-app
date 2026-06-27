import { useEffect, useRef } from 'react'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { useApi } from '../api/client'

// Comportamiento de notificaciones mientras la app está en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export function usePushNotifications() {
  const { post, del } = useApi()
  const router = useRouter()
  const notificationListener = useRef<Notifications.EventSubscription>()
  const responseListener = useRef<Notifications.EventSubscription>()

  useEffect(() => {
    registerToken()

    // Notificación recibida con la app abierta — solo la mostramos (el handler la gestiona)
    notificationListener.current = Notifications.addNotificationReceivedListener(() => {})

    // Usuario toca la notificación — navegar a la pantalla correspondiente
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const screen = response.notification.request.content.data?.screen as string | undefined
      if (screen) router.push(`/(tabs)/${screen}` as any)
    })

    return () => {
      notificationListener.current?.remove()
      responseListener.current?.remove()
    }
  }, [])

  async function registerToken() {
    if (!Device.isDevice) return

    const { status: existing } = await Notifications.getPermissionsAsync()
    let finalStatus = existing

    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') return

    // En Android hay que crear el canal antes de obtener el token
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'SportShot',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1D9E75',
      })
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
    })

    await post('/push-tokens', {
      token,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
    }).catch(() => {})
  }
}
