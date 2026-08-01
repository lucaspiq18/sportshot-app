import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomBytes } from 'crypto'
import { prisma } from '../lib/prisma'

function generateReferralCode(): string {
  return randomBytes(4).toString('hex').toUpperCase() // ej. "A3F9B2C1"
}

const photographerSchema = z.object({
  fullName: z.string().min(2).max(80),
  city: z.string().min(2).max(60),
  sports: z.array(z.string()).min(1).max(10),
  bio: z.string().max(300).optional(),
  referralCode: z.string().max(20).optional(),
})

const teamSchema = z.object({
  fullName: z.string().min(2).max(80),
  clubName: z.string().min(2).max(80),
  sport: z.string().min(2).max(40),
  city: z.string().min(2).max(60),
  category: z.string().max(40).optional(),
})

export async function onboardingRoutes(app: FastifyInstance) {

  // Estadísticas de referidos del fotógrafo
  app.get('/referrals', async (req, reply) => {
    const photographerId = req.user.photographerId
    if (!photographerId) return reply.status(403).send({ data: null, error: { code: 'NOT_PHOTOGRAPHER', message: 'Acceso denegado' } })

    const photographer = await prisma.photographer.findUnique({
      where: { id: photographerId },
      select: {
        referralCode: true,
        referrals: {
          select: {
            id: true,
            user: { select: { fullName: true } },
            bookings: {
              where: { payment: { referrerPhotographerId: photographerId, status: 'transferred' } },
              select: { payment: { select: { referrerPayout: true } } },
            },
          },
        },
      },
    })

    const referrals = (photographer?.referrals ?? []).map(r => ({
      id: r.id,
      fullName: r.user.fullName,
      completedBookings: r.bookings.length,
      totalEarned: r.bookings.reduce((acc, b) => acc + (b.payment?.referrerPayout ?? 0), 0),
    }))

    return {
      data: {
        referralCode: photographer?.referralCode,
        referrals,
        totalReferrals: referrals.length,
        totalEarned: referrals.reduce((acc, r) => acc + r.totalEarned, 0),
      },
      error: null,
    }
  })

  // Datos del usuario autenticado (perfil)
  app.get('/me', async (req) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, fullName: true, email: true, avatarUrl: true, role: true, phone: true },
    })
    return { data: user, error: null }
  })

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

    // Resolver referidor si viene un código
    let referredById: string | null = null
    if (body.referralCode) {
      const referrer = await prisma.photographer.findUnique({
        where: { referralCode: body.referralCode.toUpperCase() },
      })
      referredById = referrer?.id ?? null
    }

    const [user, photographer] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { role: 'photographer', fullName: body.fullName },
      }),
      prisma.photographer.create({
        data: {
          user: { connect: { id: userId } },
          city: body.city,
          sports: body.sports,
          bio: body.bio,
          referralCode: generateReferralCode(),
          ...(referredById ? { referredBy: { connect: { id: referredById } } } : {}),
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
