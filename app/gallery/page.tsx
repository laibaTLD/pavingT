'use client';

import { useMemo } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import type { Page } from '@/app/lib/types';
import { Footer } from '@/app/components/layout/Footer';
import { HeroSection } from '@/app/components/sections/HeroSection';
import { CTASection } from '@/app/components/sections/CTASection';
import { HardcodedGalleryGrid } from '@/app/components/sections/HardcodedGalleryGrid';
import { getThemeColors } from '@/app/lib/themeBuilder';

export default function GalleryPage() {
  const { site, pages, loading } = useWebBuilder();

  const homePage = useMemo(
    () => pages.find((p: Page) => p.pageType === 'home' && p.status === 'published')
      || pages.find((p: Page) => p.pageType === 'home'),
    [pages]
  );

  const themeColors = getThemeColors(site);
  const themeFonts = {
    heading: site?.theme?.headingFont,
    body: site?.theme?.bodyFont,
  };

  return (
    <div
      className="flex min-h-screen flex-col selection:bg-black/10 selection:text-inherit"
      style={{
        backgroundColor: themeColors.pageBackground,
        color: themeColors.mainText,
        fontFamily: themeFonts.body,
      }}
    >
      <main className="flex-1">
        {!loading && homePage?.hero && (
          <HeroSection hero={homePage.hero} page={homePage} />
        )}

        {!loading && <HardcodedGalleryGrid />}

        {!loading && homePage?.ctaSection && (
          <CTASection ctaSection={homePage.ctaSection} />
        )}

        {loading && (
          <div className="flex min-h-[40vh] items-center justify-center">
            <p
              className="text-xs uppercase tracking-[0.3em] text-[var(--wb-text-secondary)]"
              style={{ fontFamily: themeFonts.body }}
            >
              Loading…
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
