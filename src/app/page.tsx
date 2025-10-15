import { BookDialog } from '@/components/book'
import Streamer from '@/components/streamer'
import { CloudArrowUpIcon, ServerIcon, VideoCameraIcon } from '@heroicons/react/20/solid'
import { Suspense } from 'react'
import LoginDialogComponent from './(auth)/login/dialog-component'
import { Logo } from './logo'

const features = [
  {
    name: 'Book your session.',
    description: 'Our AI-assisted cameras capture every match from the field.',
    icon: VideoCameraIcon,
  },
  {
    name: 'Upload.',
    description: 'Games are automatically stored and processed in our system.',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'View anytime.',
    description: 'Parents, players, and coaches can replay matches and access insights on demand.',
    icon: ServerIcon,
  },
]

export default function LoginPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return (
    <Suspense fallback={<>...</>}>
      <div className="relative h-screen w-screen overflow-x-hidden bg-white py-24 sm:py-32 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            <div className="lg:pt-4 lg:pr-8">
              <div className="lg:max-w-lg">
                <h2 className="text-base/7 font-semibold text-pink-700 dark:text-white">
                  <Logo className="flex items-center" size="lg" />
                </h2>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-pretty text-gray-900 dark:text-white">
                  Relive Every Match. Improve Every Game.
                </p>
                <p className="mt-6 text-lg/8 text-gray-700 dark:text-gray-300">
                  Watch games anytime, get clear team insights, and support player development with simple, actionable
                  feedback.
                </p>
                <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-gray-600 lg:max-w-none dark:text-gray-400">
                  {features.map((feature) => (
                    <div key={feature.name} className="relative pl-9">
                      <dt className="inline font-semibold text-gray-900 dark:text-white">
                        <feature.icon
                          aria-hidden="true"
                          className="absolute top-1 left-1 size-5 text-pink-600 dark:text-pink-400"
                        />
                        {feature.name}
                      </dt>{' '}
                      <dd className="inline">{feature.description}</dd>
                    </div>
                  ))}
                </dl>
                <BookDialog />
              </div>
            </div>
            <div className="aspect-video w-3xl max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-228 md:-ml-4 lg:-ml-0 dark:ring-white/10">
              <div className="aspect-video w-full overflow-hidden p-2 saturate-50">
                <div className="h-full overflow-hidden rounded-lg">
                  <Streamer id="7ec9dbcc814569074a7e66ede8605cb7" width={1680} height={720} autoplay muted />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="fixed w-full max-sm:bottom-6 max-sm:left-1/2 max-sm:max-w-xs max-sm:-translate-x-1/2 sm:top-0 sm:right-0">
          <div className="flex w-full justify-center max-sm:rounded-2xl max-sm:bg-black/80 sm:justify-end">
            {/** Repeat elements with this */}
            <div className="sm:py-2 sm:not-last:px-2 sm:last:pr-2">
              <LoginDialogComponent searchParams={searchParams} />
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  )
}
