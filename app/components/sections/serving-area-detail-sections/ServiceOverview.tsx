'use client';

import { useMemo } from 'react';
import { OptimizedImage, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import { tiptapToText } from '@/app/lib/seo';
import { cn, getImageSrc } from '@/app/lib/utils';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { AnimatedHeading, EASE } from '@/components/AnimatedTitle';
import { EditorialBackdrop, SECTION, SectionRail, SectionTopAccent } from '@/components/EditorialSection';
import { themeSurface } from '@/lib/theme';
import { useEditorialTheme } from '@/hooks/useEditorialTheme';

interface ServiceOverviewProps {
  overview: unknown;
  className?: string;
}

type OverviewData = {
  title?: unknown;
  description?: unknown;
  imageUrl?: string;
  imageAlt?: string;
};

function normalizeImage(raw: unknown): { url: string; altText?: string } | undefined {
  if (!raw) return undefined;
  if (typeof raw === 'string' && raw.trim()) return { url: raw.trim() };
  if (typeof raw === 'object' && raw !== null && 'url' in raw) {
    const record = raw as { url?: string; altText?: string };
    if (record.url?.trim()) return { url: record.url.trim(), altText: record.altText };
  }
  return undefined;
}

/** Overview title / description / image only — no feature-point cards. */
function normalizeOverviewSection(overview: unknown): OverviewData | null {
  if (!overview || typeof overview !== 'object') return null;

  const data = overview as Record<string, unknown>;
  if (data.enabled === false) return null;

  const title = data.title;
  const description = data.description ?? data.subtitle ?? data.secondaryDescription;
  const image = normalizeImage(data.image ?? data.backgroundImage ?? data.media);

  if (!title && !description && !image) return null;

  return {
    title,
    description,
    imageUrl: image?.url ? getImageSrc(image.url) : undefined,
    imageAlt: image?.altText?.trim() || undefined,
  };
}

export const ServiceOverview: React.FC<ServiceOverviewProps> = ({ overview, className }) => {
  const theme = useEditorialTheme();
  const primaryColor = theme.primary;
  const borderTint = themeSurface(primaryColor, 0.2);

  const section = useMemo(() => normalizeOverviewSection(overview), [overview]);

  const resolvedHeading = useMemo(
    () => tiptapToText(section?.title) || 'Service Overview',
    [section?.title]
  );

  const resolvedDescription = useMemo(
    () => tiptapToText(section?.description),
    [section?.description]
  );

  const { ref: triggerRef, isVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.12,
  });
  const loaded = isVisible;

  if (!section) return null;

  return (
    <section id="service-overview" className={cn(SECTION.wrap, className)}>
      <EditorialBackdrop primaryColor={primaryColor} />
      <SectionTopAccent primaryColor={primaryColor} />
      <div ref={triggerRef} className={SECTION.container}>
        <div
          className={cn(
            'grid grid-cols-1 items-center gap-8 lg:gap-12',
            section.imageUrl ? 'lg:grid-cols-12' : ''
          )}
        >
          <div className={cn('min-w-0', section.imageUrl ? 'lg:col-span-6' : 'lg:col-span-8')}>
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
              <span className={SECTION.labelBar} style={{ backgroundColor: primaryColor }} />
              Service Overview
            </p>
            <AnimatedHeading
              title={resolvedHeading}
              loaded={loaded}
              baseDelay={0.2}
              lightSweep
            />
            {resolvedDescription && (
              <p
                className={`mt-8 max-w-xl ${SECTION.body}`}
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
            )}
          </div>

          {section.imageUrl ? (
            <div
              className="relative aspect-[4/3] w-full overflow-hidden border sm:aspect-[16/11] lg:col-span-6 lg:aspect-auto lg:min-h-[360px]"
              style={{
                borderColor: borderTint,
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'translateY(0)' : 'translateY(24px)',
                transition: `opacity 0.85s ${EASE}, transform 0.85s ${EASE}`,
                transitionDelay: '0.45s',
              }}
            >
              <OptimizedImage
                src={section.imageUrl}
                alt={section.imageAlt || resolvedHeading}
                fill
                className="object-cover object-center"
                sizes={IMAGE_SIZES.sectionHalf}
              />
            </div>
          ) : (
            <div className="hidden lg:col-span-4 lg:flex lg:justify-end lg:pt-2">
              <SectionRail index="06" loaded={loaded} primaryColor={primaryColor} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ServiceOverview;
