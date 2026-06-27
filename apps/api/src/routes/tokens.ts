import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

const registerSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(['ios', 'android']),
})

export async function tokensRoutes(app: FastifyInstance) {
  // Registrar token al arrancar la app o cuando cambia
  app.post('/push-tokens', async (req, reply) => {
    const { token, platform } = registerSchema.parse(req.body)
    const userId = req.user.userId

    await prisma.pushToken.upsert({
      where: { token },
      create: { userId, token, platform },
      update: { userId },
    })

    return { data: { ok: true }, error: null }
  })

  // Eliminar token al cerrar sesión
  app.delete('/push-tokens/:token', async (req, reply) => {
    const { token } = req.params as { token: string }
    const userId = req.user.userId

    await prisma.pushToken.deleteMany({ where: { token, userId } })

    return { data: { ok: true }, error: null }
  })
}
