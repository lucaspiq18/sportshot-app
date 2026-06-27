import '@fastify/jwt'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      sub: string
      userId: string
      role: string | null
      photographerId: string | null
      teamId: string | null
    }
    user: {
      sub: string
      userId: string
      role: string | null
      photographerId: string | null
      teamId: string | null
    }
  }
}
