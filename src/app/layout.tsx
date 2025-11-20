import { ThemeProvider } from '@/contexts/ThemeContext'
import type { Metadata } from 'next'
import './globals.css'

// Note: Google Fonts temporarily disabled for static export compatibility
// Will be re-enabled with proper fallbacks in production
const geistSans = {
  variable: '--font-geist-sans'
}

const geistMono = {
  variable: '--font-geist-mono'
}

export const metadata: Metadata = {
  metadataBase: new URL('https://ncalteen.github.io/copilot-extend-extra'),
  title: 'Copilot Extend Extra',
  description:
    'A game built with Next.js and GitHub Copilot. Test your skills and see how high you can score!',
  keywords: ['github copilot', 'nextjs', 'react', 'game'],
  authors: [{ name: 'Nick Alteen', url: 'https://github.com/ncalteen' }],
  openGraph: {
    title: 'Copilot Extend Extra',
    description: 'A game built with Next.js and GitHub Copilot',
    type: 'website',
    url: 'https://ncalteen.github.io/copilot-extend-extra',
    siteName: 'GitHub Copilot Game',
    images: [
      {
        url: '/favicon.ico',
        width: 32,
        height: 32,
        alt: 'Game Icon'
      }
    ]
  },
  twitter: {
    card: 'summary',
    title: 'Copilot Extend Extra',
    description: 'A game built with Next.js and GitHub Copilot'
  },
  robots: 'index, follow'
}

export const viewport = {
  width: 'device-width',
  initialScale: 1
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
