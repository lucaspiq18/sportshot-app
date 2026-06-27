import { useAuth } from '@clerk/clerk-expo'
import type { ApiResult } from '@sportshot/types'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'

async function request<T>(
  path: string,
  options: RequestInit & { token: string }
): Promise<T> {
  const { token, ...rest } = options
  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...rest.headers,
    },
  })

  const json: ApiResult<T> = await res.json()

  if (json.error) throw new Error(json.error.message)
  return json.data as T
}

export function useApi() {
  const { getToken } = useAuth()

  async function get<T>(path: string): Promise<T> {
    const token = await getToken()
    return request<T>(path, { method: 'GET', token: token! })
  }

  async function post<T>(path: string, body: unknown): Promise<T> {
    const token = await getToken()
    return request<T>(path, { method: 'POST', body: JSON.stringify(body), token: token! })
  }

  async function del<T>(path: string): Promise<T> {
    const token = await getToken()
    return request<T>(path, { method: 'DELETE', token: token! })
  }

  return { get, post, del }
}
