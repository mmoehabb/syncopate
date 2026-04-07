import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Syncopate | Code-First Coordination',
  description: 'Your board, on autopilot. Stop updating tickets. Just push code.',
}

import { CommandProvider } from '../context/CommandContext'
import { CommandBar } from '../components/CommandBar'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetBrainsMono.variable} dark`}>
      <body className="antialiased min-h-screen flex flex-col relative pb-16">
        <CommandProvider>
          {children}
          <CommandBar />
        </CommandProvider>
      </body>
    </html>
  )
}
