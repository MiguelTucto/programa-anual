import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Plus_Jakarta_Sans } from 'next/font/google'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300','400','500','600','700'],
})
export const metadata: Metadata = {
  title: 'Sistema de Gestión SST - Programa Anual',
  description: 'Sistema de gestión del Programa Anual de Seguridad y Salud en el Trabajo',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode
}>) {
  return (
      <html lang="es" className={`${jakarta.variable} bg-background`}>
      <body className="font-sans antialiased min-h-screen text-[15px] leading-relaxed">
      {children}
      {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
      </html>
  )
}
