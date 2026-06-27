export type UserRole = 'photographer' | 'team' | 'admin'

export type PhotographerTier = 'new' | 'active' | 'pro' | 'elite'

export type SlotStatus = 'open' | 'booked' | 'cancelled'

export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn'

export type BookingStatus = 'confirmed' | 'completed' | 'cancelled' | 'disputed'

export type PaymentStatus = 'authorized' | 'captured' | 'transferred' | 'refunded'

export interface User {
  id: string
  email: string
  role: UserRole
  fullName: string
  phone: string | null
  avatarUrl: string | null
  createdAt: Date
  verifiedAt: Date | null
}

export interface Photographer {
  id: string
  userId: string
  bio: string | null
  sports: string[]
  city: string
  tier: PhotographerTier
  commissionPct: number
  totalEarned: number
  stripeAccountId: string | null
  stripeOnboarded: boolean
  ratingAvg: number
  ratingCount: number
}

export interface Team {
  id: string
  userId: string
  clubName: string
  sport: string
  city: string
  category: string | null
  logoUrl: string | null
  verified: boolean
}

export interface AvailabilitySlot {
  id: string
  photographerId: string
  startsAt: Date
  endsAt: Date
  sport: string
  city: string
  status: SlotStatus
  createdAt: Date
}

export interface Deliverables {
  photoCount: number
  deadlineHours: number
  usage: Array<'social_media' | 'press' | 'internal'>
}

export interface Offer {
  id: string
  slotId: string
  teamId: string
  eventName: string
  budgetOffered: number
  deliverables: Deliverables
  message: string | null
  status: OfferStatus
  createdAt: Date
  expiresAt: Date
}

export interface Booking {
  id: string
  offerId: string
  slotId: string
  teamId: string
  photographerId: string
  agreedPrice: number
  status: BookingStatus
  createdAt: Date
}

export interface Payment {
  id: string
  bookingId: string
  stripePaymentIntentId: string
  stripeTransferId: string | null
  amount: number
  commissionPct: number
  commissionAmount: number
  photographerPayout: number
  status: PaymentStatus
  capturedAt: Date | null
  transferredAt: Date | null
}

export interface Delivery {
  id: string
  bookingId: string
  filesUrl: string[]
  photoCount: number
  deliveredAt: Date
  approvedAt: Date | null
  reviewDeadline: Date
}

export interface Review {
  id: string
  bookingId: string
  reviewerId: string
  rating: number
  comment: string | null
  createdAt: Date
}
