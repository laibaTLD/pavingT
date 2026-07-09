import type { Metadata } from 'next'
import './globals.css'
import { WebBuilderProvider } from '@/app/providers/WebBuilderProvider'
import { ErrorBoundary } from '@/app/components/ui/ErrorBoundary'
import { ThemeFontWrapper } from './components/ui/ThemeFontWrapper'
import { LanguageProvider } from '@/app/i18n/LanguageProvider'
import { LenisProvider } from '@/app/components/cinematic/LenisProvider'
import { AmbientFoundation } from '@/app/components/cinematic/AmbientFoundation'
import { HeroIntroProvider } from '@/app/providers/HeroIntroProvider'
import { Header } from '@/app/components/layout/Header'
import { fetchInitialSiteData } from '@/app/lib/serverSiteData'

export const metadata: Metadata = {
  title: 'Web Builder Site',
  description: 'Generated site using Web Builder',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const initialData = await fetchInitialSiteData()

  return (
    <html lang="en">
      <body suppressHydrationWarning className="antialiased">
        <ErrorBoundary>
          <WebBuilderProvider initialData={initialData}>
            <LanguageProvider>
              <LenisProvider>
                <AmbientFoundation />
                <HeroIntroProvider>
                  <ThemeFontWrapper>
                    <Header />
                    <main className="relative z-10 min-h-screen pt-[var(--wb-header-height)]">
                      {children}
                    </main>
                  </ThemeFontWrapper>
                </HeroIntroProvider>
              </LenisProvider>
            </LanguageProvider>
          </WebBuilderProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
