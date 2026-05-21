import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Space_Grotesk, Libre_Baskerville } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const _spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});
const _libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  variable: '--font-libre-baskerville',
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'EIPsInsight Documentation',
  description: 'Track Ethereum Improvement Proposals with live status, governance signals, lifecycle data, and historical context.',
  icons: {
    icon: '/eipFavicon.png',
    shortcut: '/eipFavicon.png',
    apple: '/eipFavicon.png',
  },
  metadataBase: new URL('https://docs.eipsinsight.com'),
  openGraph: {
    title: 'EIPsInsight Documentation',
    description: 'Track Ethereum Improvement Proposals with live status, governance signals, lifecycle data, and historical context.',
    url: 'https://docs.eipsinsight.com',
    siteName: 'EIPsInsight',
    images: [
      {
        url: '/docseipsinsighthero.png',
        width: 865,
        height: 463,
        alt: 'EIPsInsight documentation hero preview',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EIPsInsight Documentation',
    description: 'Track Ethereum Improvement Proposals with live status, governance signals, lifecycle data, and historical context.',
    images: ['/docseipsinsighthero.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${_spaceGrotesk.variable} ${_libreBaskerville.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
