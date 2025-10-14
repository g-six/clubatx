import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { session_id, ...user } = await req.json()
  const token = jwt.sign(
    user, // The payload containing user information
    process.env.JWT_SECRET_KEY!, // The secret key for signing the token
    { expiresIn: '1h' } // Optional: Set an expiration time (e.g., '1h', '7d')
  )

  return NextResponse.json(
    {
      session_id,
    },
    {
      headers: {
        'x-token': token,
      },
    }
  )
}
