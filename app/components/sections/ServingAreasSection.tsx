'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Page, Service, ServiceAreaPage } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getBusinessTagline } from '@/app/lib/siteContent';
import { tiptapToText } from '@/app/lib/seo';
import { cn } from '@/app/lib/utils';
import {
  getAreaCity,
  getAreaRegion,
  getServiceAreaPageHref,
  getServiceSlugFromAreaPage,
  normalizeSlug,
  resolveServiceSlug,
} from '@/app/lib/serviceAreaSlugs';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { AnimatedHeading, EASE, ENTRANCE } from '@/components/AnimatedTitle';
import { EditorialBackdrop, SECTION, SectionRail, SectionTopAccent } from '@/components/EditorialSection';
import { themeSurface } from '@/lib/theme';
import { useEditorialTheme } from '@/hooks/useEditorialTheme';

interface ServingAreasSectionProps {
  servingAreasSection?: Page['servingAreasSection'];
  className?: string;
}

type DisplayArea = {
  city: string;
  region: string;
  href?: string;
  serviceSlug: string;
};

function resolveAreaCity(area: unknown): string {
  const fromHelper = getAreaCity(area);
  if (fromHelper) return fromHelper;

  if (area && typeof area === 'object') {
    const record = area as Record<string, unknown>;
    for (const key of ['area', 'location', 'label', 'title', 'name']) {
      const value = record[key];
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
  }

  return '';
}

function normalizeServiceArea(area: unknown): Omit<DisplayArea, 'href' | 'serviceSlug'> | null {
  const city = resolveAreaCity(area);
  if (!city) return null;

  return { city, region: getAreaRegion(area) };
}

function isVisibleService(service: Service): boolean {
  return service.status !== 'draft' && service.status !== 'archived';
}

function areaKey(area: Pick<DisplayArea, 'city' | 'region'>): string {
  return `${area.city.toLowerCase()}|${area.region.toLowerCase()}`;
}

function enrichArea(
  area: Omit<DisplayArea, 'href' | 'serviceSlug'>,
  serviceSlug: string,
  serviceAreaPages: ServiceAreaPage[] | undefined
): DisplayArea {
  const href = getServiceAreaPageHref(serviceSlug, area, serviceAreaPages);
  return { ...area, serviceSlug, href: href || undefined };
}

export function buildServiceAreas(
  servingAreasSection: Page['servingAreasSection'] | undefined,
  services: Service[],
  serviceAreaPages: ServiceAreaPage[],
  siteServiceAreas: string[] | undefined
): DisplayArea[] {
  const result: DisplayArea[] = [];
  const seen = new Set<string>();

  const addArea = (area: unknown, serviceSlug: string) => {
    const normalized = normalizeServiceArea(area);
    if (!normalized) return;
    const key = areaKey(normalized);
    if (seen.has(key)) return;
    seen.add(key);
    result.push(enrichArea(normalized, serviceSlug, serviceAreaPages));
  };

  const resolveSlugForPage = (page: ServiceAreaPage): string => {
    const serviceRef = page.serviceId as string | { slug?: string } | undefined;
    if (serviceRef && typeof serviceRef === 'object' && serviceRef.slug) {
      return resolveServiceSlug({ slug: serviceRef.slug });
    }
    if (typeof serviceRef === 'string') {
      const svc = services.find((s) => s._id === serviceRef);
      if (svc) return resolveServiceSlug(svc);
    }
    return 'service';
  };

  const addAreasFromServiceAreaPages = (filterPublished = true) => {
    serviceAreaPages.forEach((page) => {
      if (filterPublished && page.status !== 'published') return;
      if (!page.city?.trim()) return;
      addArea({ city: page.city, region: page.region }, resolveSlugForPage(page));
    });
  };

  const addAreasFromServiceAreaPagesForSlug = (slug: string, filterPublished = true) => {
    const normSlug = normalizeSlug(slug);
    serviceAreaPages.forEach((page) => {
      if (filterPublished && page.status !== 'published') return;
      if (!page.city?.trim()) return;
      const pageSlug = getServiceSlugFromAreaPage(page) || resolveSlugForPage(page);
      if (normalizeSlug(pageSlug) !== normSlug) return;
      addArea({ city: page.city, region: page.region }, normSlug);
    });
  };

  const sectionSlug = servingAreasSection?.serviceSlug?.trim();
  if (sectionSlug) {
    const normSectionSlug = normalizeSlug(sectionSlug);
    const match = services.find((s) => resolveServiceSlug(s) === normSectionSlug);
    const slug = match ? resolveServiceSlug(match) : normSectionSlug;

    addAreasFromServiceAreaPagesForSlug(slug, true);
    if (result.length === 0) addAreasFromServiceAreaPagesForSlug(slug, false);
    if (result.length === 0) {
      (match?.serviceAreas ?? []).forEach((area) => addArea(area, slug));
    }
    return result;
  }

  addAreasFromServiceAreaPages(true);
  if (result.length > 0) return result;

  const visibleServices = services.filter(isVisibleService);
  for (const service of visibleServices) {
    const slug = resolveServiceSlug(service);
    (service.serviceAreas ?? []).forEach((area) => addArea(area, slug));
  }
  if (result.length > 0) return result;

  const defaultSlug = visibleServices[0]
    ? resolveServiceSlug(visibleServices[0])
    : services[0]
      ? resolveServiceSlug(services[0])
      : 'service';
  (siteServiceAreas ?? []).forEach((area) => addArea(area, defaultSlug));
  if (result.length > 0) return result;

  addAreasFromServiceAreaPages(false);
  return result;
}

export function ServingAreasSection({
  servingAreasSection,
  className,
}: ServingAreasSectionProps) {
  const { site, services, serviceAreaPages } = useWebBuilder();

  const theme = useEditorialTheme();
  const primaryColor = theme.primary;

  const serviceAreas = useMemo(
    () =>
      buildServiceAreas(
        servingAreasSection,
        services,
        serviceAreaPages,
        site?.serviceAreas
      ),
    [servingAreasSection, services, serviceAreaPages, site?.serviceAreas]
  );

  const resolvedTitle = useMemo(
    () => tiptapToText(servingAreasSection?.title) || 'Areas We Serve',
    [servingAreasSection?.title]
  );

  const resolvedDescription = useMemo(
    () =>
      tiptapToText(servingAreasSection?.description) ||
      getBusinessTagline(site) ||
      'Proudly serving communities across the region with reliable land clearing and site preparation.',
    [servingAreasSection?.description, site]
  );

  const { ref: triggerRef, isVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.12,
  });
  const loaded = isVisible;

  const INITIAL_VISIBLE = 3;
  const [listExpanded, setListExpanded] = useState(false);
  const hasMoreAreas = serviceAreas.length > INITIAL_VISIBLE;
  const visibleAreas = listExpanded
    ? serviceAreas
    : serviceAreas.slice(0, INITIAL_VISIBLE);

  const borderTint = themeSurface(primaryColor, 0.22);
  const gridColClass =
    serviceAreas.length >= 3
      ? 'sm:grid-cols-2 lg:grid-cols-3'
      : 'sm:grid-cols-2';

  const uniqueRegions = useMemo(
    () =>
      [...new Set(serviceAreas.map((a) => a.region).filter(Boolean))] as string[],
    [serviceAreas]
  );

  if (servingAreasSection?.enabled === false) return null;
  if (!serviceAreas.length) return null;

  return (
    <section id="service-areas" className={cn(SECTION.wrap, className)}>
      <EditorialBackdrop primaryColor={primaryColor} />
      <SectionTopAccent primaryColor={primaryColor} />
      <div ref={triggerRef} className={SECTION.container}>
        <div className={SECTION.header}>
          <div className="lg:col-span-8 min-w-0">
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
              Coverage
            </p>
            <AnimatedHeading
              title={resolvedTitle}
              loaded={loaded}
              baseDelay={0.2}
              lightSweep
            />
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
          </div>
          <div className="hidden lg:flex lg:col-span-4 lg:justify-end lg:pt-2">
            <SectionRail index="12" loaded={loaded} primaryColor={primaryColor} />
          </div>
        </div>

        <div className={`${SECTION.content} grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10 lg:items-start`}>
          <aside
            className="lg:col-span-3 lg:sticky lg:top-28"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'translateY(0)' : 'translateY(20px)',
              transition: `opacity 0.7s ${EASE}, transform 0.7s ${EASE}`,
              transitionDelay: '0.6s',
            }}
          >
            <div
              className="border p-6 md:p-7"
              style={{
                borderColor: borderTint,
                backgroundColor: themeSurface(primaryColor, 0.04),
              }}
            >
              <p
                className="text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--wb-text-secondary)]"
                style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
              >
                Service footprint
              </p>
              <p
                className="mt-3 text-4xl tabular-nums leading-none text-[var(--wb-text-main)] md:text-5xl"
                style={{ fontFamily: 'var(--wb-heading-font, Georgia, serif)' }}
              >
                {serviceAreas.length}
              </p>
              <p
                className="mt-1 text-sm text-[var(--wb-text-secondary)]"
                style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
              >
                {serviceAreas.length === 1 ? 'community served' : 'communities served'}
              </p>
              {uniqueRegions.length > 0 && (
                <div className="mt-6 border-t pt-6" style={{ borderColor: borderTint }}>
                  <p
                    className="mb-3 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--wb-text-secondary)]"
                    style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
                  >
                    Regions
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {uniqueRegions.map((region) => (
                      <li
                        key={region}
                        className="border px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-[var(--wb-text-secondary)]"
                        style={{
                          fontFamily: 'var(--wb-body-font, sans-serif)',
                          borderColor: themeSurface(primaryColor, 0.2),
                        }}
                      >
                        {region}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>

          <div className="min-w-0 lg:col-span-9">
            <div
              className={`grid grid-cols-1 ${gridColClass} gap-0 border-t border-l`}
              style={{ borderColor: borderTint }}
            >
              {visibleAreas.map((area, i) => {
                const fromLeft = i % 2 === 0;
                const cardDelay = 0.5 + i * 0.07;

                const card = (
                  <article
                    className="group relative border-r border-b bg-[color-mix(in_srgb,var(--wb-card-bg-light)_55%,transparent)] p-5 transition-colors duration-300 hover:bg-[var(--wb-card-bg-light)] md:p-6"
                    style={{
                      borderColor: borderTint,
                      clipPath: loaded
                        ? 'inset(0 0 0 0)'
                        : fromLeft
                          ? 'inset(0 100% 0 0)'
                          : 'inset(0 0 0 100%)',
                      opacity: loaded ? 1 : 0,
                      transform: loaded ? 'translateY(0)' : 'translateY(16px)',
                      transition: `clip-path ${ENTRANCE} ${EASE}, opacity 0.7s ${EASE}, transform 0.7s ${EASE}, background-color 0.35s ease`,
                      transitionDelay: `${cardDelay}s`,
                    }}
                  >
                    <div
                      className="absolute top-0 left-0 h-[2px] w-0 transition-all duration-500 group-hover:w-full"
                      style={{ backgroundColor: primaryColor }}
                    />

                    <span
                      className="pointer-events-none absolute bottom-3 right-4 select-none text-3xl font-normal leading-none"
                      style={{
                        fontFamily: 'var(--wb-heading-font, Georgia, serif)',
                        color: themeSurface(primaryColor, 0.1),
                      }}
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <div
                      className="mb-4 inline-flex h-9 w-9 items-center justify-center border text-[var(--wb-text-secondary)] transition-colors duration-300 group-hover:text-[var(--wb-text-main)]"
                      style={{ borderColor: themeSurface(primaryColor, 0.25) }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M12 21s-8-4.5-8-11a8 8 0 1 1 16 0c0 6.5-8 11-8 11z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>

                    {area.region && (
                      <p
                        className="text-[10px] uppercase tracking-[0.18em] text-[var(--wb-text-secondary)]"
                        style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
                      >
                        {area.region}
                      </p>
                    )}
                    <h3
                      className="relative z-10 mt-1 text-base font-normal leading-snug text-[var(--wb-text-main)] md:text-lg"
                      style={{ fontFamily: 'var(--wb-heading-font, Georgia, serif)' }}
                    >
                      {area.city}
                    </h3>

                    {area.href && (
                      <span
                        className="relative z-10 mt-4 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                        style={{
                          fontFamily: 'var(--wb-body-font, sans-serif)',
                          color: primaryColor,
                        }}
                      >
                        View area
                        <span aria-hidden="true">→</span>
                      </span>
                    )}
                  </article>
                );

                return area.href ? (
                  <Link key={areaKey(area)} href={area.href} className="block">
                    {card}
                  </Link>
                ) : (
                  <div key={areaKey(area)}>{card}</div>
                );
              })}
            </div>

            {hasMoreAreas && (
              <button
                type="button"
                onClick={() => setListExpanded((prev) => !prev)}
                aria-expanded={listExpanded}
                aria-label={listExpanded ? 'Show fewer serving areas' : 'Show more serving areas'}
                className="mt-6 flex w-full items-center justify-between border px-4 py-3 text-left text-sm transition-opacity hover:opacity-70"
                style={{
                  borderColor: borderTint,
                  fontFamily: 'var(--wb-body-font, sans-serif)',
                  color: 'var(--wb-text-main)',
                }}
              >
                <span>{listExpanded ? 'Show less' : 'Show more serving areas'}</span>
                <span
                  className="text-base"
                  style={{ color: primaryColor }}
                  aria-hidden="true"
                >
                  {listExpanded ? '↑' : '↓'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ServingAreasSection;
