# Deploy en Railway

## Requisitos previos
- Cuenta en [railway.app](https://railway.app)
- CLI de Railway: `npm install -g @railway/cli`
- Repositorio en GitHub conectado a Railway

---

## 1. Crear el proyecto en Railway

```bash
railway login
railway init
# Nombre del proyecto: sportshot
```

---

## 2. Añadir servicios gestionados (desde el panel web)

En el panel de Railway → New Service:

| Servicio | Tipo | Variables que genera |
|---|---|---|
| **sportshot-db** | PostgreSQL | `DATABASE_URL` |
| **sportshot-redis** | Redis | `REDIS_URL` |

Railway inyecta estas variables automáticamente al API si están en el mismo proyecto.

---

## 3. Crear el servicio del API

```bash
railway up --service api
```

O desde el panel: New Service → GitHub Repo → seleccionar rama `main`.

Railway detecta el `Dockerfile` automáticamente.

---

## 4. Variables de entorno del API

En Railway → api → Variables, añadir:

```
NODE_ENV=production
JWT_SECRET=<genera uno con: openssl rand -hex 32>
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
API_BASE_URL=https://<tu-dominio>.railway.app
APP_SCHEME=sportshot
APP_URL=https://sportshot.app
```

`DATABASE_URL` y `REDIS_URL` los inyecta Railway automáticamente desde los servicios creados en el paso 2.

---

## 5. Dominio personalizado

En Railway → api → Settings → Networking:
- Generar dominio Railway: `api-sportshot.up.railway.app`
- O añadir dominio propio: `api.sportshot.app` + registro CNAME

Actualizar `API_BASE_URL` con el dominio definitivo.

---

## 6. Webhooks de Stripe

Con el dominio del API definido, registrar los endpoints en el panel de Stripe:

**Cuenta principal** → Developers → Webhooks → Add endpoint:
```
https://api.sportshot.app/api/v1/webhooks/stripe

Eventos a escuchar:
  payment_intent.succeeded
  payment_intent.payment_failed
  transfer.created
```

**Connect** → Developers → Webhooks → Add endpoint:
```
https://api.sportshot.app/api/v1/webhooks/stripe/connect

Eventos a escuchar:
  account.updated
```

Copiar los `whsec_...` generados y pegarlos en las variables de Railway.

---

## 7. Verificar el deploy

```bash
# Ver logs en tiempo real
railway logs --service api

# Comprobar health
curl https://api.sportshot.app/health
# → {"ok":true}

# Ver migraciones aplicadas
railway run --service api npx prisma migrate status
```

---

## 8. Entornos (staging vs producción)

Railway gestiona entornos por rama de Git:

| Rama | Entorno | URL |
|---|---|---|
| `main` | Producción | `api.sportshot.app` |
| `develop` | Staging | `api-staging.sportshot.app` |

Crear el entorno staging desde Railway → Environments → New Environment.

---

## Resumen de servicios en Railway

```
proyecto: sportshot
├── api          ← Fastify + Prisma + BullMQ workers
├── sportshot-db ← PostgreSQL 16
└── sportshot-redis ← Redis 7
```

Los tres servicios comparten la misma red privada de Railway — la conexión entre ellos no sale a internet.
