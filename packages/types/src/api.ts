import type { AvailabilitySlot, Offer, Booking, Photographer } from './entities'

export interface ApiResponse<T> {
  data: T
  error: null
}

export interface ApiError {
  data: null
  error: {
    code: string
    message: string
  }
}

export type ApiResult<T> = ApiResponse<T> | ApiError

// Slots
export interface CreateSlotBody {
  startsAt: string
  endsAt: string
  sport: string
  city: string
}

export interface SlotWithPhotographer extends AvailabilitySlot {
  photographer: Photographer & { user: { fullName: string; avatarUrl: string | null } }
  offerCount: number
}

// Offers
export interface CreateOfferBody {
  slotId: string
  eventName: string
  budgetOffered: number
  deliverables: {
    photoCount: number
    deadlineHours: number
    usage: Array<'social_media' | 'press' | 'internal'>
  }
  message?: string
}

export interface OfferWithDetails extends Offer {
  slot: AvailabilitySlot
  team: { clubName: string; logoUrl: string | null; sport: string }
}

// Bookings
export interface BookingWithDetails extends Booking {
  offer: Offer
  slot: AvailabilitySlot
}
