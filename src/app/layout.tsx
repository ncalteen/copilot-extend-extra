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
  title: 'RE:ACT — Chain Reaction Arcade',
  description:
    'One spark changes everything. An original chain-reaction arcade game: position, charge, detonate, and turn a single spark into a high score.',
  keywords: ['github copilot', 'nextjs', 'react', 'game'],
  authors: [{ name: 'Nick Alteen', url: 'https://github.com/ncalteen' }],
  openGraph: {
    title: 'RE:ACT — Chain Reaction Arcade',
    description:
      'One spark changes everything. Play a free chain-reaction arcade game.',
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
    title: 'RE:ACT — Chain Reaction Arcade',
    description:
      'One spark changes everything. Play a free chain-reaction arcade game.'
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
