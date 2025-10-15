import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const payload = await req.json()
  console.log(JSON.stringify(payload, null, 2))
  return NextResponse.json({
    message: 'Thanks!',
  })
}
