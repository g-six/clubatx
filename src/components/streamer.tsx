'use client'

import { Stream } from '@cloudflare/stream-react'

export default function Streamer({ id, width, height, ...props }: any) {
  return (
    <Stream
      src={id || '7ec9dbcc814569074a7e66ede8605cb7'}
      width={width?.toString()}
      height={height?.toString()}
      {...props}
    />
  )
}
