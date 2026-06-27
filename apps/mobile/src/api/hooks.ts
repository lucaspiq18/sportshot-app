import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from './client'
import type { SlotWithPhotographer, OfferWithDetails, CreateSlotBody, CreateOfferBody, BookingWithDetails } from '@sportshot/types'

// ── Photographers ─────────────────────────────────────────────────────────────

export function usePhotographerProfile(photographerId: string) {
  const { get } = useApi()
  return useQuery({
    queryKey: ['photographer', photographerId],
    queryFn: () => get<any>(`/photographers/${photographerId}`),
    enabled: !!photographerId,
  })
}

// ── Slots ────────────────────────────────────────────────────────────────────

export function useSlots(filters: { sport?: string; city?: string; date?: string } = {}) {
  const { get } = useApi()
  const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][])
  return useQuery({
    queryKey: ['slots', filters],
    queryFn: () => get<SlotWithPhotographer[]>(`/slots?${params}`),
  })
}

export function useMySlots() {
  const { get } = useApi()
  return useQuery({
    queryKey: ['my-slots'],
    queryFn: () => get<SlotWithPhotographer[]>('/slots/mine'),
  })
}

export function useCreateSlot() {
  const { post } = useApi()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateSlotBody) => post('/slots', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-slots'] }),
  })
}

export function useDeleteSlot() {
  const { del } = useApi()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (slotId: string) => del(`/slots/${slotId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-slots'] }),
  })
}

// ── Offers ───────────────────────────────────────────────────────────────────

export function useReceivedOffers() {
  const { get } = useApi()
  return useQuery({
    queryKey: ['offers-received'],
    queryFn: () => get<OfferWithDetails[]>('/offers/received'),
    refetchInterval: 30_000,
  })
}

export function useCreateOffer() {
  const { post } = useApi()
  return useMutation({
    mutationFn: (body: CreateOfferBody) => post('/offers', body),
  })
}

export function useAcceptOffer() {
  const { post } = useApi()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (offerId: string) => post(`/offers/${offerId}/accept`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['offers-received'] })
      qc.invalidateQueries({ queryKey: ['my-slots'] })
      qc.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}

export function useRejectOffer() {
  const { post } = useApi()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (offerId: string) => post(`/offers/${offerId}/reject`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['offers-received'] }),
  })
}

// ── Stripe Connect ───────────────────────────────────────────────────────────

export interface ConnectStatus {
  hasAccount: boolean
  onboarded: boolean
  chargesEnabled: boolean
  payoutsEnabled: boolean
  requirements: string[]
}

export function useConnectStatus() {
  const { get } = useApi()
  return useQuery({
    queryKey: ['connect-status'],
    queryFn: () => get<ConnectStatus>('/connect/status'),
  })
}

export function useStartOnboarding() {
  const { post } = useApi()
  return useMutation({
    mutationFn: () => post<{ url: string }>('/connect/onboarding', {}),
  })
}

// ── Bookings ─────────────────────────────────────────────────────────────────

export function useBookings() {
  const { get } = useApi()
  return useQuery({
    queryKey: ['bookings'],
    queryFn: () => get<BookingWithDetails[]>('/bookings'),
  })
}

// ── Reviews ──────────────────────────────────────────────────────────────────

export interface Review {
  id: string
  rating: number
  comment?: string
  createdAt: string
  reviewer: { fullName: string }
  booking: { offer: { eventName: string } }
}

export interface ReviewSummary {
  reviews: Review[]
  pagination: { total: number; page: number; limit: number; pages: number }
  summary: { ratingAvg: string; ratingCount: number } | null
}

export function usePhotographerReviews(photographerId: string) {
  const { get } = useApi()
  return useQuery({
    queryKey: ['reviews', photographerId],
    queryFn: () => get<ReviewSummary>(`/photographers/${photographerId}/reviews`),
    enabled: !!photographerId,
  })
}

export function useCreateReview() {
  const { post } = useApi()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ bookingId, rating, comment }: { bookingId: string; rating: number; comment?: string }) =>
      post(`/bookings/${bookingId}/review`, { rating, comment }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] })
      qc.invalidateQueries({ queryKey: ['reviews'] })
    },
  })
}
