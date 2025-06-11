import type { Metadata } from 'next'
import { Sora } from 'next/font/google'
import './globals.css'

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-sora', // optional CSS variable name
})

export const metadata: Metadata = {
  title: 'HuntLy - Smart People Search Engine',
  description: 'Find the perfect talent with AI-powered search. Search professionals by skills, location, and experience.',
  keywords: 'people search, talent search, professional finder, developer search, blockchain experts, AI talent',
  authors: [{ name: 'HuntLy Team' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://3398-2405-201-4a-70a0-f578-6ab7-3051-2e18.ngrok-free.app'),
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
    <html lang="en" className={sora.variable}>
  <body className="font-sans antialiased min-h-screen bg-background">
    {children}
  </body>
</html>
  )
}