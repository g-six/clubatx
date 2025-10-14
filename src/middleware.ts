import { NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: ['/api/messages'],
}

export async function middleware(req: NextRequest) {
  if (req.method === 'POST') {
    const clone = req.clone()
    const raw = await clone.text()
    // @ts-ignore - stash raw body for route verification
    ;(req as any).__rawBody = raw
    return NextResponse.next({
      request: {
        // body: raw, // keep the original stream consumable in the route
      },
    })
  }
  return NextResponse.next()
}
