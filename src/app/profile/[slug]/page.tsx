import { createClient } from '@/utils/supabase/server'

import { notFound, redirect } from 'next/navigation'

import { Suspense } from 'react'

export default async function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createClient()
  const { slug } = await params
  const athlete = await supabase.from('athletes').select('*').eq('slug', slug).single()

  if (athlete?.data?.slug) redirect(`https://profile.veo.co/player/${athlete?.data?.slug}`)
  else notFound()

  return (
    <Suspense fallback={<>Loading...</>}>
      <>Loading https://profile.veo.co/player/{athlete?.data?.slug}...</>
    </Suspense>
  )
}
