'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getPageHref } from '@/app/lib/siteContent';
import { tiptapToText } from '@/app/lib/seo';
import { cn, getImageSrc } from '@/app/lib/utils';
import { OptimizedImage, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { AnimatedHeading, EASE, ENTRANCE } from '@/components/AnimatedTitle';
import { EditorialBackdrop, SECTION, SectionTopAccent } from '@/components/EditorialSection';
import { themeSurface } from '@/lib/theme';
import { useEditorialTheme } from '@/hooks/useEditorialTheme';

interface CompanyDetailSectionProps {
  companyDetailSection?: Page['companyDetailSection'];
  className?: string;
}

type DetailCard = {
  heading: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
};

function mapDetailCards(
  details: NonNullable<Page['companyDetailSection']>['details'] | undefined
): DetailCard[] {
  if (!details?.length) return [];

  return details
    .slice(0, 3)
    .map((detail) => {
      const heading =
        tiptapToText(detail.title) || detail.label?.trim() || '';
      const description =
        tiptapToText(detail.description) || tiptapToText(detail.value) || '';
      const imageUrl = detail.image?.url ? getImageSrc(detail.image.url) : '';

      return {
        heading,
        description,
        imageUrl,
        imageAlt:
          detail.image?.altText?.trim() || heading || 'Company detail',
      };
    })
    .filter((card) => card.heading || card.description || card.imageUrl);
}

export function CompanyDetailSection({
  companyDetailSection,
  className,
}: CompanyDetailSectionProps) {
  const { pages } = useWebBuilder();

  const theme = useEditorialTheme();
  const primaryColor = theme.primary;
  const secondaryColor = theme.secondaryText;

  const resolvedHeading = useMemo(
    () =>
      tiptapToText(companyDetailSection?.title) ||
      'Built on Experience & Trust',
    [companyDetailSection?.title]
  );

  const resolvedDescription = useMemo(
    () => tiptapToText(companyDetailSection?.description),
    [companyDetailSection?.description]
  );

  const cards = useMemo(
    () => mapDetailCards(companyDetailSection?.details),
    [companyDetailSection?.details]
  );

  const ctaHref = useMemo(() => {
    const contactPage = pages?.find((p) => p.pageType === 'contact');
    return contactPage ? getPageHref(contactPage) : '#contact';
  }, [pages]);

  const { ref: triggerRef, isVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.12,
  });
  const loaded = isVisible;

  const borderTint = themeSurface(primaryColor, 0.2);
  const [leadCard, ...supportCards] = cards;

  if (!companyDetailSection || companyDetailSection.enabled === false) return null;
  if (!cards.length) return null;

  return (
    <section id="company-details" className={cn(SECTION.wrap, className)}>
      <EditorialBackdrop primaryColor={primaryColor} />
      <SectionTopAccent primaryColor={primaryColor} />
      <div ref={triggerRef} className={SECTION.container}>
        <div className={SECTION.header}>
          <div className="min-w-0 lg:col-span-12">
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
              Company Details
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
        </div>

        <div
          className={`${SECTION.content} grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-12 lg:grid-rows-2 lg:gap-5`}
        >
          {leadCard && (
            <article
              className="group relative flex flex-col overflow-hidden border lg:col-span-7 lg:row-span-2"
              style={{
                borderColor: borderTint,
                borderLeftWidth: '3px',
                borderLeftColor: primaryColor,
                backgroundColor: themeSurface(primaryColor, 0.04),
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'translateY(0)' : 'translateY(28px)',
                transition: `opacity 0.85s ${EASE}, transform 0.85s ${EASE}`,
                transitionDelay: '0.55s',
              }}
            >
              <div className="relative aspect-[16/11] w-full overflow-hidden lg:aspect-auto lg:min-h-[280px] lg:flex-1">
                {leadCard.imageUrl ? (
                  <OptimizedImage
                    src={leadCard.imageUrl}
                    alt={leadCard.imageAlt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    sizes={IMAGE_SIZES.sectionHalf}
                  />
                ) : (
                  <div
                    className="h-full min-h-[200px] w-full"
                    style={{ background: themeSurface(secondaryColor, 0.18) }}
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col p-6 md:p-8 lg:p-10">
                <span
                  className="text-[10px] font-medium uppercase tracking-[0.28em]"
                  style={{
                    fontFamily: 'var(--wb-body-font, sans-serif)',
                    color: primaryColor,
                  }}
                >
                  Primary focus
                </span>
                <h4
                  className="mt-3 text-2xl text-[var(--wb-text-main)] md:text-3xl"
                  style={{ fontFamily: 'var(--wb-heading-font, Georgia, serif)' }}
                >
                  {leadCard.heading}
                </h4>
                <p
                  className="mt-4 flex-1 text-sm leading-relaxed text-[var(--wb-text-secondary)] md:text-[0.9375rem]"
                  style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
                >
                  {leadCard.description}
                </p>
                <Link
                  href={ctaHref}
                  className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] transition-transform duration-300 hover:translate-x-1"
                  style={{
                    fontFamily: 'var(--wb-body-font, sans-serif)',
                    color: primaryColor,
                  }}
                >
                  Learn more
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          )}

          {supportCards.map((section, i) => (
            <article
              key={`refcard-${i + 1}`}
              className="group relative flex flex-col border p-6 md:flex-row md:items-center md:gap-6 md:p-7 lg:col-span-5"
              style={{
                borderColor: borderTint,
                backgroundColor: 'color-mix(in srgb, var(--wb-card-bg-light) 45%, transparent)',
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'translateY(0)' : 'translateY(20px)',
                clipPath: loaded
                  ? 'inset(0 0 0 0)'
                  : 'inset(0 0 100% 0)',
                transition: `clip-path ${ENTRANCE} ${EASE}, opacity 0.75s ${EASE}, transform 0.75s ${EASE}, background-color 0.35s ease`,
                transitionDelay: `${0.7 + i * 0.12}s`,
              }}
            >
              <div
                className="relative mb-5 h-20 w-20 shrink-0 overflow-hidden md:mb-0"
                style={{ border: `1px solid ${borderTint}` }}
              >
                {section.imageUrl ? (
                  <OptimizedImage
                    src={section.imageUrl}
                    alt={section.imageAlt}
                    fill
                    className="object-cover"
                    sizes={IMAGE_SIZES.thumb}
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center text-lg"
                    style={{
                      fontFamily: 'var(--wb-heading-font, Georgia, serif)',
                      color: themeSurface(primaryColor, 0.35),
                      background: themeSurface(primaryColor, 0.08),
                    }}
                  >
                    {String(i + 2).padStart(2, '0')}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <span
                    className="h-px w-6 shrink-0"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <span
                    className="text-[10px] uppercase tracking-[0.22em] text-[var(--wb-text-secondary)]"
                    style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
                  >
                    0{i + 2}
                  </span>
                </div>
                <h4
                  className="mt-2 text-lg text-[var(--wb-text-main)] md:text-xl"
                  style={{ fontFamily: 'var(--wb-heading-font, Georgia, serif)' }}
                >
                  {section.heading}
                </h4>
                <p
                  className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--wb-text-secondary)]"
                  style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
                >
                  {section.description}
                </p>
                <Link
                  href={ctaHref}
                  className="mt-4 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] opacity-0 transition-all duration-300 group-hover:opacity-100"
                  style={{
                    fontFamily: 'var(--wb-body-font, sans-serif)',
                    color: primaryColor,
                  }}
                >
                  Details
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CompanyDetailSection;
