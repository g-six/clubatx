import { sendMessage } from '@/lib/sms/send-message'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { message, athletes } = await req.json()

  const promises = await Promise.all(
    athletes.map((inv: { phone: string; name: string }) =>
      sendMessage({
        phone_number: inv.phone,
        message: `Hi ${inv.name},\n${message}`,
      })
    )
  )

  return NextResponse.json({
    athletes,
    message,
    promises,
  })
}
