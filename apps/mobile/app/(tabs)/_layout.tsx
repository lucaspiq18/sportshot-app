import { Tabs } from 'expo-router'
import { useSessionStore } from '../../src/store/session'
import { colors, font } from '../../src/theme'
import { Text } from 'react-native'

function TabIcon({ icon, color }: { icon: string; color: string }) {
  return <Text style={{ fontSize: 18, color }}>{icon}</Text>
}

export default function TabsLayout() {
  const role = useSessionStore((s) => s.role)
  const isPhotographer = role === 'photographer'

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.bar,
          borderTopWidth: 0.5,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontFamily: font.label,
          fontSize: 9,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
        },
        headerStyle: { backgroundColor: colors.bar },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontFamily: font.heading,
          fontSize: 18,
          color: colors.accent,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
        },
        headerTintColor: colors.accent,
      }}
    >
      {isPhotographer ? (
        <>
          <Tabs.Screen
            name="photographer/slots"
            options={{ title: 'Disponibilidad', tabBarLabel: 'Slots', tabBarIcon: ({ color }) => <TabIcon icon="📅" color={color} /> }}
          />
          <Tabs.Screen
            name="photographer/offers"
            options={{ title: 'Ofertas recibidas', tabBarLabel: 'Ofertas', tabBarIcon: ({ color }) => <TabIcon icon="📨" color={color} /> }}
          />
          <Tabs.Screen
            name="photographer/payments"
            options={{ title: 'Pagos', tabBarLabel: 'Pagos', tabBarIcon: ({ color }) => <TabIcon icon="💳" color={color} /> }}
          />
          <Tabs.Screen name="team/explore" options={{ href: null }} />
          <Tabs.Screen name="team/offer" options={{ href: null }} />
        </>
      ) : (
        <>
          <Tabs.Screen
            name="team/explore"
            options={{ title: 'SportShot', tabBarLabel: 'Buscar', tabBarIcon: ({ color }) => <TabIcon icon="🔍" color={color} /> }}
          />
          <Tabs.Screen name="team/offer" options={{ href: null }} />
          <Tabs.Screen name="photographer/slots" options={{ href: null }} />
          <Tabs.Screen name="photographer/offers" options={{ href: null }} />
          <Tabs.Screen name="photographer/payments" options={{ href: null }} />
        </>
      )}
      <Tabs.Screen
        name="bookings"
        options={{ title: 'Reservas', tabBarLabel: 'Reservas', tabBarIcon: ({ color }) => <TabIcon icon="📋" color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Perfil', tabBarLabel: 'Perfil', tabBarIcon: ({ color }) => <TabIcon icon="👤" color={color} /> }}
      />
    </Tabs>
  )
}
