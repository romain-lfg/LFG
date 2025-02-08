import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import QueryProvider from '@/providers/QueryProvider'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: {
    template: '%s | LFG',
    default: 'LFG - Looking For Bounties',
  },
  description: 'Autonomous agent-driven bounty matching platform powered by blockchain technology',
  keywords: ['blockchain', 'ethereum', 'bounty', 'virtual synergy agents', 'VSA', 'web3', 'smart contracts'],
  authors: [{ name: 'LFG Team' }],
  openGraph: {
    title: 'LFG - Virtual Synergy Agents',
    description: 'Connect with the perfect bounty through autonomous blockchain agents',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body className={`${spaceGrotesk.className} antialiased`}>
        <QueryProvider>
          <Navbar />
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
