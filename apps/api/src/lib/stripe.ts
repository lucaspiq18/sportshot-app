import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

export const COMMISSION_PCT = 10
export const REFERRER_PCT = 1

export function calculateSplit(amount: number, hasReferrer: boolean = false) {
  if (hasReferrer) {
    const referrerPayout = Math.round(amount * REFERRER_PCT / 100)
    const commissionAmount = Math.round(amount * (COMMISSION_PCT - REFERRER_PCT) / 100) // 9%
    const photographerPayout = amount - commissionAmount - referrerPayout // 90%
    return { commissionAmount, photographerPayout, referrerPayout }
  }
  const commissionAmount = Math.round(amount * COMMISSION_PCT / 100)
  const photographerPayout = amount - commissionAmount
  return { commissionAmount, photographerPayout, referrerPayout: 0 }
}
