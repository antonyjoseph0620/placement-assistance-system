import './globals.css'
import CursorGlow from '@/components/CursorGlow'

export const metadata = {
  title: 'PlacementGPT | AI Placement & Career Guidance',
  description: 'AI-powered Placement Eligibility and Career Guidance Assistant for engineering students.',
  keywords: 'PlacementGPT, AI Placement, Career Guidance, Eligibility Checker, Student Dashboard',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        {/* Background Elements */}
        <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none z-0"></div>
        <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-blob" style={{ backgroundColor: 'var(--color-accent-blue)' }}></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-blob" style={{ backgroundColor: 'var(--color-accent-purple)' }}></div>
        <div className="fixed top-[40%] right-[10%] w-[30vw] h-[30vw] rounded-full blur-blob" style={{ backgroundColor: 'var(--color-accent-violet)' }}></div>
        
        {/* Main Content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>
        <CursorGlow />
      </body>
    </html>
  )
}
