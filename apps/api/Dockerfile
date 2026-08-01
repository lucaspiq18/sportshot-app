FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

FROM base AS deps
COPY package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY apps/api/prisma ./apps/api/prisma
RUN npm install --workspace=apps/api --workspace=packages/types
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

FROM deps AS builder
COPY packages/types ./packages/types
COPY apps/api ./apps/api
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma && npm run build --workspace=apps/api

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/node_modules/.prisma ./apps/api/node_modules/.prisma
COPY --from=builder /app/apps/api/node_modules/@prisma ./apps/api/node_modules/@prisma
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
WORKDIR /app/apps/api
RUN npx prisma generate
CMD ["node", "dist/index.js"]
