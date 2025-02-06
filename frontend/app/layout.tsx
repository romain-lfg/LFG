import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'LFG - Looking For Bounties',
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
    <html lang="en">
      <body className={spaceGrotesk.className}>{children}</body>
    </html>
  )
}
