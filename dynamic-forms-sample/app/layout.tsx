import { cn } from '@/components/lib/utils'
import type { Metadata } from 'next'
import { Geist, Geist_Mono, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({
  variable:'--font-mono',
  subsets:['latin'],
})

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  description: 'Complete school forms for your student.',
  title: 'School Forms',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      className={cn(
        'h-full',
        'antialiased',
        geistSans.variable,
        geistMono.variable,
        'font-mono',
        jetbrainsMono.variable,
      )}
      lang="en"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
