'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
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
import { AnimatedHeading, EASE } from '@/components/AnimatedTitle';
import { EditorialBackdrop, SECTION, SectionTopAccent } from '@/components/EditorialSection';
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

/** Cities hidden from the serving-areas grid (CMS orphans / unwanted pages). */
const EXCLUDED_AREA_CITIES = new Set(['north bend']);

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
  const safeServices = Array.isArray(services) ? services : [];
  const safePages = Array.isArray(serviceAreaPages) ? serviceAreaPages : [];

  const addArea = (area: unknown, serviceSlug: string) => {
    const normalized = normalizeServiceArea(area);
    if (!normalized) return;
    if (EXCLUDED_AREA_CITIES.has(normalized.city.toLowerCase())) return;
    const key = areaKey(normalized);
    if (seen.has(key)) return;
    seen.add(key);
    result.push(enrichArea(normalized, serviceSlug, safePages));
  };

  const resolveSlugForPage = (page: ServiceAreaPage): string => {
    const serviceRef = page.serviceId as string | { slug?: string } | undefined;
    if (serviceRef && typeof serviceRef === 'object' && serviceRef.slug) {
      return resolveServiceSlug({ slug: serviceRef.slug });
    }
    if (typeof serviceRef === 'string') {
      const svc = safeServices.find((s) => s._id === serviceRef);
      if (svc) return resolveServiceSlug(svc);
    }
    return 'service';
  };

  const visibleServices = safeServices.filter(isVisibleService);
  const defaultSlug = visibleServices[0]
    ? resolveServiceSlug(visibleServices[0])
    : safeServices[0]
      ? resolveServiceSlug(safeServices[0])
      : 'service';

  const sectionSlug = servingAreasSection?.serviceSlug?.trim();
  const scopedSlug = sectionSlug
    ? (() => {
        const norm = normalizeSlug(sectionSlug);
        const match = safeServices.find((s) => resolveServiceSlug(s) === norm);
        return match ? resolveServiceSlug(match) : norm;
      })()
    : null;

  // On home, service-area CMS pages are href enrichment only — not a city source
  // (orphan pages like North Bend were injecting extra cards).
  // On scoped service sections, include that service's area pages.
  if (scopedSlug) {
    safePages.forEach((page) => {
      if (page.status === 'draft' || page.status === 'archived') return;
      if (!page.city?.trim()) return;
      const pageSlug = getServiceSlugFromAreaPage(page) || resolveSlugForPage(page);
      if (normalizeSlug(pageSlug) !== scopedSlug) return;
      addArea({ city: page.city, region: page.region }, scopedSlug);
    });

    const match = safeServices.find((s) => resolveServiceSlug(s) === scopedSlug);
    (match?.serviceAreas ?? []).forEach((area) => addArea(area, scopedSlug));
  } else {
    for (const service of visibleServices) {
      const slug = resolveServiceSlug(service);
      (service.serviceAreas ?? []).forEach((area) => addArea(area, slug));
    }
  }

  (siteServiceAreas ?? []).forEach((area) =>
    addArea(area, scopedSlug || defaultSlug)
  );

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

  // Keep last non-empty list only for empty flashes during load.
  const stableAreasRef = useRef<DisplayArea[]>([]);
  if (serviceAreas.length > 0) {
    stableAreasRef.current = serviceAreas;
  }
  const displayAreas =
    serviceAreas.length > 0 ? serviceAreas : stableAreasRef.current;

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

  // Content stays visible — scroll-reveal opacity was resetting when secondary
  // API data arrived ~3–4s after reload (Lenis/layout refresh + remount).
  const loaded = true;

  // Fill at least 3 rows of a 4-col grid before collapsing behind "Show more".
  const INITIAL_VISIBLE = 12;
  const [listExpanded, setListExpanded] = useState(false);
  const hasMoreAreas = displayAreas.length > INITIAL_VISIBLE;
  const visibleAreas = listExpanded
    ? displayAreas
    : displayAreas.slice(0, INITIAL_VISIBLE);

  const borderTint = themeSurface(primaryColor, 0.22);
  const gridColClass =
    displayAreas.length >= 4
      ? 'sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
      : displayAreas.length >= 3
        ? 'sm:grid-cols-2 lg:grid-cols-3'
        : 'sm:grid-cols-2';

  const uniqueRegions = useMemo(
    () =>
      [...new Set(displayAreas.map((a) => a.region).filter(Boolean))] as string[],
    [displayAreas]
  );

  if (servingAreasSection?.enabled === false) return null;
  if (!displayAreas.length) return null;

  return (
    <section id="service-areas" className={cn(SECTION.wrap, 'overflow-visible', className)}>
      <EditorialBackdrop primaryColor={primaryColor} />
      <SectionTopAccent primaryColor={primaryColor} />
      <div className={SECTION.container}>
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
        </div>

        <div
          className={`${SECTION.content} grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-10`}
        >
          {/* Sticky must not use transform — transform creates a containing block. */}
          <aside className="lg:sticky lg:top-[calc(var(--wb-header-height)+1.25rem)] lg:col-span-3 lg:self-start">
            <div
              className="border p-6 md:p-7"
              style={{
                borderColor: borderTint,
                backgroundColor: themeSurface(primaryColor, 0.04),
                opacity: loaded ? 1 : 0,
                transition: `opacity 0.7s ${EASE}`,
                transitionDelay: '0.35s',
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
                {displayAreas.length}
              </p>
              <p
                className="mt-1 text-sm text-[var(--wb-text-secondary)]"
                style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
              >
                {displayAreas.length === 1 ? 'community served' : 'communities served'}
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
              className={`grid grid-cols-1 ${gridColClass} gap-3 sm:gap-4`}
              style={{
                opacity: loaded ? 1 : 0,
                transition: `opacity 0.7s ${EASE}`,
                transitionDelay: '0.25s',
              }}
            >
              {visibleAreas.map((area, i) => {
                const cardHref = '/serving-areas';
                const card = (
                  <article
                    className={cn(
                      'relative h-full border bg-[color-mix(in_srgb,var(--wb-card-bg-light)_55%,transparent)] px-3.5 py-3.5 transition-colors duration-300 md:px-4 md:py-4',
                      'cursor-pointer hover:bg-[var(--wb-card-bg-light)] group-hover:bg-[var(--wb-card-bg-light)]'
                    )}
                    style={{ borderColor: borderTint, borderWidth: '1px' }}
                  >
                    <div
                      className="absolute left-0 top-0 h-[2px] w-0 transition-all duration-500 group-hover:w-full"
                      style={{ backgroundColor: primaryColor }}
                    />

                    <span
                      className="pointer-events-none absolute bottom-2.5 right-3 select-none text-2xl font-normal leading-none"
                      style={{
                        fontFamily: 'var(--wb-heading-font, Georgia, serif)',
                        color: themeSurface(primaryColor, 0.1),
                      }}
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <div
                      className="mb-3 inline-flex h-8 w-8 items-center justify-center border text-[var(--wb-text-secondary)] transition-colors duration-300 group-hover:border-[var(--wb-primary)] group-hover:text-[var(--wb-text-main)]"
                      style={{ borderColor: themeSurface(primaryColor, 0.25) }}
                    >
                      <svg
                        width="14"
                        height="14"
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

                    {area.region ? (
                      <p
                        className="text-[10px] uppercase tracking-[0.18em] text-[var(--wb-text-secondary)]"
                        style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
                      >
                        {area.region}
                      </p>
                    ) : null}

                    <h3
                      className="relative z-10 mt-1 text-sm font-normal leading-snug text-[var(--wb-text-main)] md:text-base"
                      style={{ fontFamily: 'var(--wb-heading-font, Georgia, serif)' }}
                    >
                      {area.city}
                    </h3>

                    <span
                      className="relative z-10 mt-3 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--wb-text-main)] transition-all duration-300 group-hover:translate-x-0.5"
                      style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
                    >
                      Explore areas
                      <span aria-hidden="true">→</span>
                    </span>
                  </article>
                );

                return (
                  <Link
                    key={areaKey(area)}
                    href={cardHref}
                    className="group block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
                    style={{ outlineColor: primaryColor }}
                  >
                    {card}
                  </Link>
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
                <span>
                  {listExpanded
                    ? 'Show less'
                    : `Show ${displayAreas.length - INITIAL_VISIBLE} more serving areas`}
                </span>
                <span className="text-base" style={{ color: primaryColor }} aria-hidden="true">
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
