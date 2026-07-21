'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getPageHref } from '@/app/lib/siteContent';
import { tiptapToText } from '@/app/lib/seo';
import { cn } from '@/app/lib/utils';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { useParallaxMouse } from '@/hooks/useParallaxMouse';
import { AnimatedHeading, EASE, ENTRANCE } from '@/components/AnimatedTitle';
import { EditorialBackdrop, SECTION, SectionTopAccent } from '@/components/EditorialSection';
import { themeSurface } from '@/lib/theme';
import { useEditorialTheme } from '@/hooks/useEditorialTheme';

interface WhyChooseUsSectionProps {
  whyChooseUsSection?: Page['whyChooseUsSection'];
  className?: string;
}

type HighlightItem = {
  name: string;
  description: string;
};

function getServiceIcon(name: string) {
  const normalize = name.toLowerCase();
  if (normalize.includes('excavation')) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 21h20M5 21v-7l3-3h4l3 3v7M11 11V5l3-2h4l1 3-3 5Z" />
      </svg>
    );
  }
  if (normalize.includes('clearing')) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18M6 6l12 12M12 2v2M12 20v2M2 12h2M20 12h2" />
      </svg>
    );
  }
  if (normalize.includes('easement') || normalize.includes('utility')) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 2h10v4H7zM5 6h14v3H5zM12 9v13M9 14h6M8 18h8" />
      </svg>
    );
  }
  if (normalize.includes('mulching') || normalize.includes('forestry')) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 22h20L12 2zm0 6l6 10H6l6-10z" />
        <path d="M10 16h4" />
      </svg>
    );
  }
  if (normalize.includes('driveway') || normalize.includes('grading')) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22V4c0-.5.2-1 .6-1.4C5 2.2 5.5 2 6 2h12c.5 0 1 .2 1.4.6.4.4.6.9.6 1.4v18l-4-2-4 2-4-2-4 2z" />
        <path d="M12 6v8M9 9h6" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18M5 5l14 14M19 5L5 19" />
    </svg>
  );
}

export function WhyChooseUsSection({
  whyChooseUsSection,
  className,
}: WhyChooseUsSectionProps) {
  const { pages } = useWebBuilder();

  const theme = useEditorialTheme();
  const primaryColor = theme.primary;
  const borderTint = themeSurface(primaryColor, 0.2);

  const resolvedTitle = useMemo(
    () => tiptapToText(whyChooseUsSection?.title) || 'Our Site Services',
    [whyChooseUsSection?.title]
  );

  const resolvedDescription = useMemo(
    () =>
      tiptapToText(whyChooseUsSection?.description) ||
      'Precision site preparation and heavy earthworks engineered for performance.',
    [whyChooseUsSection?.description]
  );

  const servicesToRender = useMemo(() => {
    const items: HighlightItem[] = (whyChooseUsSection?.items ?? [])
      .map((item) => ({
        name: tiptapToText(item.title),
        description: tiptapToText(item.description),
      }))
      .filter((item) => item.name || item.description);

    return items.slice(0, 5);
  }, [whyChooseUsSection?.items]);

  const servicesHref = useMemo(() => {
    const servicesPage = pages.find((p) => p.pageType === 'service-list');
    return servicesPage ? getPageHref(servicesPage) : '/services';
  }, [pages]);

  const sectionRef = useRef<HTMLElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const { ref: triggerRef, isVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.12,
  });
  const loaded = isVisible || reducedMotion;
  const anim = !reducedMotion;
  const mouse = useParallaxMouse(sectionRef, anim);

  const gridColClass =
    servicesToRender.length <= 1
      ? 'sm:grid-cols-1 lg:grid-cols-1'
      : servicesToRender.length === 2
        ? 'sm:grid-cols-2 lg:grid-cols-2'
        : servicesToRender.length === 3
          ? 'sm:grid-cols-2 lg:grid-cols-3'
          : servicesToRender.length === 4
            ? 'sm:grid-cols-2 lg:grid-cols-4'
            : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5';

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onMq = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onMq);
    return () => mq.removeEventListener('change', onMq);
  }, []);

  if (!whyChooseUsSection || whyChooseUsSection.enabled === false) return null;
  if (!servicesToRender.length) return null;

  return (
    <section ref={sectionRef} id="service-highlights" className={cn(SECTION.wrap, className)}>
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
                transform: loaded ? 'translateY(0)' : 'translateY(12px)',
                transition: `opacity 0.6s ${EASE}, transform 0.6s ${EASE}`,
                transitionDelay: '0.1s',
              }}
            >
              <span
                className={SECTION.labelBar}
                style={{ backgroundColor: primaryColor }}
              />
              Core Fleet Capabilities
            </p>

            <AnimatedHeading
              title={resolvedTitle}
              loaded={loaded}
              baseDelay={0.2}
              lightSweep
            />

            {resolvedDescription && (
              <p
                className="mt-8 max-w-xl text-sm leading-relaxed text-[var(--wb-text-secondary)] md:text-[0.9375rem]"
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
          className={`${SECTION.content} relative will-change-transform`}
          style={
            anim
              ? {
                  transform: `translate3d(${mouse.x * 3}px, ${mouse.y * 3}px, 0)`,
                  transition: 'transform 0.15s ease-out',
                }
              : undefined
          }
        >
          <div
            className={`w-full grid grid-cols-1 ${gridColClass} gap-0 border-t border-l`}
            style={{ borderColor: borderTint }}
          >
            {servicesToRender.map((service, index) => {
              const serviceName = service.name;
              const fromLeft = index % 2 === 0;
              const cardDelay = 0.9 + index * 0.12;
              const description = service.description;
              const truncated =
                description.length > 130 ? `${description.slice(0, 130)}...` : description;

              return (
                <article
                  key={`svc-${index}`}
                  className="group relative border-r border-b bg-[color-mix(in_srgb,var(--wb-card-bg-light)_60%,transparent)] p-6 md:p-8 transition-colors duration-500 hover:bg-[var(--wb-card-bg-light)]"
                  style={{
                    borderColor: borderTint,
                    clipPath: loaded
                      ? 'inset(0 0 0 0)'
                      : fromLeft
                        ? 'inset(0 100% 0 0)'
                        : 'inset(0 0 0 100%)',
                    opacity: loaded ? 1 : 0,
                    transform: loaded ? 'translateY(0)' : 'translateY(24px)',
                    filter: loaded ? 'blur(0)' : 'blur(8px)',
                    transition: `clip-path ${ENTRANCE} ${EASE}, opacity 0.8s ${EASE}, transform 0.8s ${EASE}, filter 0.8s ${EASE}, background-color 0.4s ease`,
                    transitionDelay: `${cardDelay}s`,
                  }}
                >
                  <div
                    className="absolute top-0 left-0 h-[2px] w-0 transition-all duration-500 group-hover:w-full"
                    style={{ backgroundColor: primaryColor }}
                  />

                  <span
                    className="pointer-events-none absolute bottom-4 right-4 select-none text-4xl font-normal leading-none"
                    style={{
                      fontFamily: 'var(--wb-heading-font, Georgia, serif)',
                      color: themeSurface(primaryColor, 0.12),
                    }}
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <div
                    className="mb-5 inline-flex h-11 w-11 items-center justify-center border bg-[var(--wb-page-bg)] text-[var(--wb-text-secondary)] transition-colors duration-300 group-hover:text-[var(--wb-text-main)]"
                    style={{ borderColor: themeSurface(primaryColor, 0.25) }}
                  >
                    {getServiceIcon(serviceName)}
                  </div>

                  <h3
                    className="relative z-10 text-lg font-normal leading-snug text-[var(--wb-text-main)] md:text-xl"
                    style={{ fontFamily: 'var(--wb-heading-font, Georgia, serif)' }}
                  >
                    {serviceName}
                  </h3>

                  <p
                    className="relative z-10 mt-3 text-sm leading-relaxed text-[var(--wb-text-secondary)]"
                    style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
                  >
                    {truncated}
                  </p>

                  <div className="relative z-10 mt-5 flex justify-end opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span
                      className="text-[10px] uppercase tracking-[0.2em] text-[var(--wb-text-secondary)]"
                      style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
                    >
                      0{index + 1}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Link
            href={servicesHref}
            className="group inline-flex items-center gap-2 text-sm transition-transform duration-300 hover:-translate-y-0.5"
            style={{
              fontFamily: 'var(--wb-body-font, sans-serif)',
              color: primaryColor,
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'translateY(0)' : 'translateY(20px)',
              transition: `opacity 0.6s ${EASE}, transform 0.6s ${EASE}`,
              transitionDelay: `${1.1 + servicesToRender.length * 0.12}s`,
            }}
          >
            View All Services
            <span
              className="inline-block transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUsSection;
