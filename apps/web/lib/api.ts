import { auth } from '@clerk/nextjs/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://sportshot-app-production.up.railway.app'

export async function apiServer<T>(path: string, options?: RequestInit): Promise<T> {
  const { getToken } = await auth()
  const token = await getToken()

  const res = await fetch(`${API_URL}/api/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  if (!res.ok) {
    let msg = `API error ${res.status}`
    try { const j = await res.json(); msg = j?.error?.message || msg } catch {}
    throw new Error(msg)
  }
  const json = await res.json()
  return json.data
}
