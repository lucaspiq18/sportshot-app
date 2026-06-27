import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

const photographerSchema = z.object({
  fullName: z.string().min(2).max(80),
  city: z.string().min(2).max(60),
  sports: z.array(z.string()).min(1).max(10),
  bio: z.string().max(300).optional(),
})

const teamSchema = z.object({
  fullName: z.string().min(2).max(80),
  clubName: z.string().min(2).max(80),
  sport: z.string().min(2).max(40),
  city: z.string().min(2).max(60),
  category: z.string().max(40).optional(),
})

export async function onboardingRoutes(app: FastifyInstance) {

  // Devuelve el estado de onboarding del usuario autenticado
  app.get('/onboarding/status', async (req) => {
    const userId = req.user.userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { photographer: true, team: true },
    })

    if (!user) return { data: { completed: false, role: null }, error: null }

    const completed = !!(user.photographer || user.team)
    const role = user.photographer ? 'photographer' : user.team ? 'team' : null

    return {
      data: {
        completed,
        role,
        photographerId: user.photographer?.id ?? null,
        teamId: user.team?.id ?? null,
      },
      error: null,
    }
  })

  // Fotógrafo completa su perfil
  app.post('/onboarding/photographer', async (req, reply) => {
    const body = photographerSchema.parse(req.body)
    const userId = req.user.userId

    const existing = await prisma.photographer.findFirst({ where: { userId } })
    if (existing) {
      return reply.status(409).send({ data: null, error: { code: 'ALREADY_ONBOARDED', message: 'Ya tienes un perfil de fotógrafo' } })
    }

    const [user, photographer] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { role: 'photographer', fullName: body.fullName },
      }),
      prisma.photographer.create({
        data: {
          userId,
          city: body.city,
          sports: body.sports,
          bio: body.bio,
        },
      }),
    ])

    return {
      data: {
        role: 'photographer',
        photographerId: photographer.id,
        userId: user.id,
      },
      error: null,
    }
  })

  // Equipo completa su perfil
  app.post('/onboarding/team', async (req, reply) => {
    const body = teamSchema.parse(req.body)
    const userId = req.user.userId

    const existing = await prisma.team.findFirst({ where: { userId } })
    if (existing) {
      return reply.status(409).send({ data: null, error: { code: 'ALREADY_ONBOARDED', message: 'Ya tienes un perfil de equipo' } })
    }

    const [user, team] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { role: 'team', fullName: body.fullName },
      }),
      prisma.team.create({
        data: {
          userId,
          clubName: body.clubName,
          sport: body.sport,
          city: body.city,
          category: body.category,
        },
      }),
    ])

    return {
      data: {
        role: 'team',
        teamId: team.id,
        userId: user.id,
      },
      error: null,
    }
  })
}
