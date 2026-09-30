'use client'

import { Button } from '@/components/ui/button'

type FormsErrorProps = {
  retry: () => void
}

export default function FormsError({ retry }: FormsErrorProps) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-4 px-6 py-12">
      <h1 className="text-2xl font-semibold">Forms are temporarily unavailable</h1>
      <p className="text-sm text-muted-foreground">
        We could not load your selected form. Please try again.
      </p>
      <Button type="button" onClick={() => retry()}>Try again</Button>
    </main>
  )
}
