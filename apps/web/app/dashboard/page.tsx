export const dynamic = 'force-dynamic'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { apiServer } from '@/lib/api'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  let status: { completed: boolean; role: string | null } | null = null
  try {
    status = await apiServer('/onboarding/status')
  } catch {
    redirect('/onboarding')
  }

  if (!status?.completed) redirect('/onboarding')
  if (status.role === 'photographer') redirect('/dashboard/photographer')
  if (status.role === 'team') redirect('/dashboard/team')

  redirect('/onboarding')
}
