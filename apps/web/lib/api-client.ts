'use client'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://sportshot-app-production.up.railway.app'

export async function apiClient<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  })

  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const msg = json?.error?.message ?? json?.error?.code ?? `Error ${res.status}`
    throw new Error(msg)
  }
  return json.data
}
