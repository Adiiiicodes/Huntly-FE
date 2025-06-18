import type { Metadata } from 'next'
import { Sora, Roboto } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/toaster'

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-sora', // optional CSS variable name
})

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto',
})

export const metadata: Metadata = {
  title: 'HuntLy - Smart People Search Engine',
  description: 'Find the perfect talent with AI-powered search. Search professionals by skills, location, and experience.',
  keywords: 'people search, talent search, professional finder, developer search, blockchain experts, AI talent',
  authors: [{ name: 'HuntLy Team' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://168.231.122.158'),
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
    <html lang="en" className={`${sora.variable} ${roboto.variable}`}>
      <body className="antialiased min-h-screen bg-background">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}