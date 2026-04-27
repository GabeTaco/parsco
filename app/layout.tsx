import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Parsco GC',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#fbf8f2', color: '#1a1512', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
