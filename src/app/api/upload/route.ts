import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const filename = searchParams.get('filename')!
  const body = request.body!
  if (!filename && !body) return NextResponse.json({}, { status: 400 })

  const blob = await put(
    `clubathletix/uploads/${new Date().toISOString().split('T').shift()!.split('-').join('/')}/${filename}`,
    body,
    {
      access: 'public',
      addRandomSuffix: false,
    }
  )

  return NextResponse.json(blob)
}
