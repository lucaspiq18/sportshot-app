import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY!)

export const FROM = 'SportShot <noreply@sportshot.app>'

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  const { error } = await resend.emails.send({ from: FROM, to, subject, html })
  if (error) throw new Error(`Email error: ${error.message}`)
}
