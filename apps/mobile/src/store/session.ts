import { create } from 'zustand'
import type { UserRole } from '@sportshot/types'

interface SessionState {
  role: UserRole | null
  userId: string | null
  photographerId: string | null
  teamId: string | null
  setSession: (data: { role: UserRole; userId: string; photographerId: string | null; teamId: string | null }) => void
  clearSession: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  role: null,
  userId: null,
  photographerId: null,
  teamId: null,
  setSession: (data) => set(data),
  clearSession: () => set({ role: null, userId: null, photographerId: null, teamId: null }),
}))
