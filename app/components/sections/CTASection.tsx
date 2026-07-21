'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getPageHref } from '@/app/lib/siteContent';
import { tiptapToText } from '@/app/lib/seo';
import { cn, getImageSrc } from '@/app/lib/utils';
import { OptimizedImage, IMAGE_QUALITY_HIGH, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { AnimatedHeading, EASE } from '@/components/AnimatedTitle';
import { EditorialBackdrop, SECTION, SectionTopAccent } from '@/components/EditorialSection';
import { themeSurface } from '@/lib/theme';
import { useEditorialTheme } from '@/hooks/useEditorialTheme';

interface CTASectionProps {
  ctaSection?: Page['ctaSection'];
  className?: string;
}

function normalizeHref(href: string): string {
  const t = href.trim();
  if (t.startsWith('http') || t.startsWith('mailto:') || t.startsWith('tel:')) return t;
  return t.startsWith('/') ? t : `/${t}`;
}

function resolveCtaImage(ctaSection?: Page['ctaSection']): string {
  if (!ctaSection) return '';

  const raw = ctaSection.backgroundImage;
  if (typeof raw === 'string' && raw.trim()) return getImageSrc(raw);

  const extended = ctaSection as Page['ctaSection'] & {
    image?: string | { url?: string; altText?: string };
    mediaItems?: Array<{ url?: string }>;
  };

  if (typeof extended.image === 'string' && extended.image.trim()) {
    return getImageSrc(extended.image);
  }
  if (extended.image && typeof extended.image === 'object' && extended.image.url) {
    return getImageSrc(extended.image.url);
  }
  const mediaUrl = extended.mediaItems?.[0]?.url;
  return mediaUrl ? getImageSrc(mediaUrl) : '';
}

export function CTASection({ ctaSection, className }: CTASectionProps) {
  const { pages } = useWebBuilder();

  const theme = useEditorialTheme();
  const primaryColor = theme.primary;

  const resolvedHeading = useMemo(
    () =>
      tiptapToText(ctaSection?.title) || 'Ready to Start Your Project?',
    [ctaSection?.title]
  );

  const resolvedDescription = useMemo(
    () =>
      tiptapToText(ctaSection?.description) ||
      'Tell us about your site and we will follow up with a clear plan, timeline, and quote.',
    [ctaSection?.description]
  );

  const ctaImage = useMemo(() => resolveCtaImage(ctaSection), [ctaSection]);

  const ctaLabel = ctaSection?.primaryButton?.label?.trim() || 'Contact Us';

  const ctaHref = useMemo(() => {
    const href = ctaSection?.primaryButton?.href?.trim();
    if (href) return normalizeHref(href);
    const contactPage = pages?.find((p) => p.pageType === 'contact');
    return contactPage ? getPageHref(contactPage) : '/contact-us';
  }, [ctaSection?.primaryButton?.href, pages]);

  const { ref: triggerRef, isVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.05,
  });
  const loaded = isVisible;

  if (ctaSection?.enabled === false) return null;

  return (
    <section id="cta" className={cn(SECTION.wrap, className)}>
      <EditorialBackdrop primaryColor={primaryColor} />
      <SectionTopAccent primaryColor={primaryColor} />
      <div ref={triggerRef} className={SECTION.container}>
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="min-w-0 lg:col-span-5 lg:row-start-1">
            <p
              className={SECTION.label}
              style={{
                fontFamily: 'var(--wb-body-font, sans-serif)',
                color: primaryColor,
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.6s ${EASE}, transform 0.6s ${EASE}`,
              }}
            >
              <span
                className={SECTION.labelBar}
                style={{ backgroundColor: primaryColor }}
              />
              Get Started
            </p>
            <AnimatedHeading
              title={resolvedHeading}
              loaded={loaded}
              baseDelay={0.2}
              lightSweep
            />
            <p
              className={`mt-4 max-w-md ${SECTION.body}`}
              style={{
                fontFamily: 'var(--wb-body-font, sans-serif)',
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'translateY(0)' : 'translateY(24px)',
                transition: `opacity 0.8s ${EASE}, transform 0.8s ${EASE}`,
                transitionDelay: '0.8s',
              }}
            >
              {resolvedDescription}
            </p>
            <Link
              href={ctaHref}
              className="mt-5 inline-block rounded-full border px-8 py-3 text-xs font-medium uppercase tracking-[0.15em] transition-all duration-300 hover:text-[var(--wb-text-on-dark)]"
              style={{
                fontFamily: 'var(--wb-body-font, sans-serif)',
                borderColor: primaryColor,
                color: primaryColor,
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.6s ${EASE}, transform 0.6s ${EASE}, background-color 0.3s ease, color 0.3s ease`,
                transitionDelay: '1s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = primaryColor;
                e.currentTarget.style.color = 'var(--wb-text-on-dark)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = primaryColor;
              }}
            >
              {ctaLabel}
            </Link>
          </div>

          {ctaImage ? (
            <div
              className="relative aspect-[4/3] overflow-hidden shadow-[0_24px_60px_color-mix(in_srgb,var(--wb-text-main)_10%,transparent)] lg:col-span-5 lg:col-start-7 lg:row-start-1"
              style={{
                border: `1px solid ${themeSurface(primaryColor, 0.2)}`,
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'scale(1)' : 'scale(1.04)',
                transition: `opacity 1s ${EASE}, transform 1s ${EASE}`,
                transitionDelay: '0.5s',
              }}
            >
              <OptimizedImage
                src={ctaImage}
                alt={resolvedHeading || 'Contact us'}
                fill
                className="object-cover"
                sizes={IMAGE_SIZES.sectionHalf}
                quality={IMAGE_QUALITY_HIGH}
              />
              <div
                className="absolute inset-0"
                style={{ background: themeSurface(primaryColor, 0.06) }}
              />
            </div>
          ) : null}

        </div>
      </div>
    </section>
  );
}

export default CTASection;
