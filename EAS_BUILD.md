# EAS Build — SportShot

## Prerrequisitos

- Node.js 18+
- Cuenta en [expo.dev](https://expo.dev) (gratis)
- Para iOS: Mac con Xcode o dejar que EAS firme en la nube
- Para Android: nada extra (EAS gestiona el keystore)

---

## 1. Instalar EAS CLI

```bash
npm install -g eas-cli
eas login
```

---

## 2. Crear el proyecto en Expo

```bash
cd apps/mobile
eas init
```

Esto genera un `projectId` (UUID). Cópialo y reemplaza `REEMPLAZAR_CON_EAS_PROJECT_ID`
en **dos sitios** de `app.json`:
- `expo.extra.eas.projectId`
- `expo.updates.url`

---

## 3. Variables de entorno

Crea `apps/mobile/.env` a partir de `.env.example`:

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

Rellena los valores reales:
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` → [dashboard.clerk.com](https://dashboard.clerk.com) → tu app → API Keys → Publishable key
- `EXPO_PUBLIC_API_URL` → la URL de Railway una vez desplegado (ej. `https://sportshot-api.railway.app/api/v1`)

---

## 4. Credenciales

### iOS
EAS puede generar y gestionar el certificado automáticamente:
```bash
eas credentials --platform ios
# Selecciona: "Manage everything with EAS" → Let EAS handle it
```

Necesitarás una cuenta Apple Developer ($99/año) para publicar en App Store.
Para pruebas internas puedes hacer un build "preview" sin cuenta de pago.

### Android
EAS genera el keystore automáticamente la primera vez que haces el build.
```bash
eas credentials --platform android
# Selecciona: "Generate new keystore"
```
**Guarda el keystore** — sin él no puedes actualizar la app en Play Store.

---

## 5. Actualizar eas.json

En `eas.json` reemplaza:
| Placeholder | Valor |
|---|---|
| `REEMPLAZAR_CON_CLERK_KEY_PROD` | Tu `pk_live_...` de Clerk |
| `TU_PROYECTO.railway.app` | URL de tu API en Railway |
| `REEMPLAZAR_CON_ASC_APP_ID` | App Store Connect App ID (solo para submit) |
| `REEMPLAZAR_CON_APPLE_TEAM_ID` | Tu Apple Team ID |

---

## 6. Build de desarrollo (para probar en dispositivo)

```bash
cd apps/mobile

# iOS (instala en dispositivo vía QR)
eas build --profile development --platform ios

# Android (descarga APK)
eas build --profile development --platform android
```

El build tarda ~10-15 min en los servidores de Expo (gratis).
Al terminar te da un enlace de descarga o QR.

---

## 7. Build de preview (testers internos)

```bash
eas build --profile preview --platform all
```

Distribuye el enlace a testers. No requiere App Store ni Play Store.

---

## 8. Build de producción

```bash
eas build --profile production --platform all
```

---

## 9. Submit a tiendas

### App Store
```bash
eas submit --platform ios --latest
```
Requiere:
1. App creada en [App Store Connect](https://appstoreconnect.apple.com)
2. `ascAppId` rellenado en `eas.json`

### Play Store
```bash
eas submit --platform android --latest
```
Requiere:
1. App creada en [Google Play Console](https://play.google.com/console)
2. Service Account JSON descargado y ruta en `eas.json`

---

## 10. Actualizaciones OTA (sin pasar por tiendas)

Para cambios que no tocan código nativo (JS, imágenes, estilos):
```bash
eas update --branch production --message "Fix: corregir precio en oferta"
```
Los usuarios recibirán la actualización en la próxima apertura de la app.

---

## Checklist antes del build de producción

- [ ] `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` apunta a la key de producción (`pk_live_...`)
- [ ] `EXPO_PUBLIC_API_URL` apunta al Railway de producción
- [ ] API desplegada en Railway y `/health` responde 200
- [ ] Webhook de Stripe registrado apuntando a Railway
- [ ] Bucket R2 creado y variables R2 en Railway
- [ ] `app.json` → `bundleIdentifier` y `package` son los definitivos (no se pueden cambiar después)
- [ ] Icono y splash en `assets/` (1024×1024 PNG para icono, fondo #0a0f14)
- [ ] Notification icon en `assets/notification-icon.png` (96×96 PNG, solo blanco/transparente en Android)
