import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import './globals.css'

const roboto = Roboto({
  weight: ['300', '400', '500', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
})

export const metadata: Metadata = {
  title: 'HuntLy - Smart People Search Engine',
  description: 'Find the perfect talent with AI-powered search. Search professionals by skills, location, and experience.',
  keywords: 'people search, talent search, professional finder, developer search, blockchain experts, AI talent',
  authors: [{ name: 'HuntLy Team' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://2625-2405-201-4a-70a0-8c11-cd71-fd69-d07.ngrok-free.app'),
  openGraph: {
    title: 'HuntLy - Smart People Search Engine',
    description: 'Find the perfect talent with AI-powered search',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HuntLy - Smart People Search Engine',
    description: 'Find the perfect talent with AI-powered search',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={roboto.variable}>
      <body className="antialiased min-h-screen bg-background">
        {children}
      </body>
    </html>
  )
}