import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { FirebaseClientProvider } from '@/firebase'
import AppShell from '@/components/layout/AppShell'

export const metadata: Metadata = {
  title: 'Punto Ferretero',
  description: 'CRM / POS tipo app para Punto Ferretero',

  // 🔥 PWA
  manifest: '/manifest.webmanifest',

  // 🔥 ICONOS (IMPORTANTE)
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },

  // 🔥 APPLE
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Punto Ferretero',
  },
}

export const viewport: Viewport = {
  themeColor: '#FFD600', // 🔥 amarillo pro
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        {/* 🔥 FUENTES */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />

        {/* 🔥 FALLBACK IOS */}
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>

      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <AppShell>{children}</AppShell>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  )
}