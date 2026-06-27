import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

export const COMMISSION_BY_TIER = {
  new: 15,
  active: 12,
  pro: 8,
  elite: 5,
} as const

export function calculateSplit(amount: number, commissionPct: number) {
  const commissionAmount = Math.round(amount * commissionPct / 100)
  const photographerPayout = amount - commissionAmount
  return { commissionAmount, photographerPayout }
}
