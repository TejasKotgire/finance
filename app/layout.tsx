import type { Metadata, Viewport } from 'next';
import { Syne, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { ToastProvider } from '@/components/ui/Toast';
import './globals.css';

const syne = Syne({
  subsets: ['latin'], variable: '--font-display',
  weight: ['400','500','600','700','800'],
});
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'], variable: '--font-body',
  weight: ['300','400','500','600','700'],
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'], variable: '--font-mono',
  weight: ['400','500','600'],
});

export const metadata: Metadata = {
  title: 'FinFlow — Personal Finance OS',
  description: 'Track wealth. Control burns. Build your future.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FinFlow',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#030507',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="mobile-web-app-capable"              content="yes" />
        <meta name="apple-mobile-web-app-capable"        content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection"                    content="telephone=no" />
        <link rel="apple-touch-icon"  href="/icons/apple-touch-icon.png" />
        <link rel="mask-icon"         href="/icons/safari-pinned-tab.svg" color="#00f5d4" />
        <link rel="icon"              href="/icons/icon.svg" type="image/svg+xml" />
      </head>
      <body className={`${syne.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-body antialiased`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
