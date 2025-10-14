import { sendEmail } from '@/lib/email/send-email'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const response = await sendEmail(body)
  return NextResponse.json(response)
}
