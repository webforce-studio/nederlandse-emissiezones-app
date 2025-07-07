import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ZE Zones Netherlands | Zero Emission & Low Emission Zone Map',
  description: 'Interactive map of Zero Emission Zones (ZE) and Low Emission Zones (LEZ) in the Netherlands. Check vehicle restrictions, exemptions, and compliance for Amsterdam, Rotterdam, The Hague, and more.',
  keywords: 'emission zones netherlands, zero emission zone, low emission zone, diesel restrictions, electric vehicle zones, amsterdam lez, rotterdam ze, vehicle restrictions',
  authors: [{ name: 'ZE Zones App' }],
  creator: 'ZE Zones App',
  publisher: 'ZE Zones App',
  openGraph: {
    title: 'ZE Zones Netherlands | Zero Emission & Low Emission Zone Map',
    description: 'Interactive map of emission zones in the Netherlands. Check vehicle restrictions and compliance.',
    url: 'https://ze-zones.nl',
    siteName: 'ZE Zones Netherlands',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZE Zones Netherlands',
    description: 'Interactive map of emission zones in the Netherlands',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://ze-zones.nl" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#5B9BD5" />
      </head>
      <body className={`${inter.className} min-h-screen bg-gray-50`}>
        {children}
      </body>
    </html>
  )
} 