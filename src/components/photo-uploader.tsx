'use client'

import { uploadRequest } from '@/lib/helpers/api'
import { type PutBlobResult } from '@vercel/blob'
import { useRef, useState } from 'react'

export default function PhotoUploader() {
  const inputFileRef = useRef<HTMLInputElement>(null)
  const [blob, setBlob] = useState<PutBlobResult | null>(null)
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <input
        name="file"
        ref={inputFileRef}
        type="file"
        required
        className="flex h-full w-full flex-col items-center justify-center opacity-20"
        onChange={async (event) => {
          event.preventDefault()

          if (!inputFileRef.current?.files?.length) {
            return
          }

          const file = inputFileRef.current.files[0]
          const response = await uploadRequest(`/api/upload?filename=${file.name}`, file)
          const newBlob = response as PutBlobResult

          setBlob(newBlob)
        }}
      />

      {blob && (
        <div>
          Blob url: <a href={blob.url}>{blob.url}</a>
        </div>
      )}
    </div>
  )
}
