'use client';

import { useMemo, useState } from 'react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { tiptapToText } from '@/app/lib/seo';
import { cn } from '@/app/lib/utils';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { AnimatedHeading, EASE } from '@/components/AnimatedTitle';
import { EditorialBackdrop, SECTION, SectionTopAccent } from '@/components/EditorialSection';
import { themeSurface } from '@/lib/theme';
import { useEditorialTheme } from '@/hooks/useEditorialTheme';

interface TestimonialsSectionProps {
  testimonialsSection?: Page['testimonialsSection'];
  className?: string;
}

type TestimonialItem = {
  text: string;
  name: string;
  role?: string;
};

function mapTestimonials(
  section?: Page['testimonialsSection'],
  siteTestimonials?: { title?: string; description?: string; testimonials: unknown[] } | null
): TestimonialItem[] {
  const fromSection = section?.testimonials ?? [];
  const source =
    fromSection.length > 0 ? fromSection : (siteTestimonials?.testimonials ?? []);

  const items: TestimonialItem[] = [];

  for (const item of source) {
    const record = item as {
      name?: string;
      role?: string;
      company?: string;
      text?: unknown;
    };
    const text = tiptapToText(record.text);
    const name = record.name?.trim() || '';
    const role = record.role?.trim() || record.company?.trim();
    if (!text && !name) continue;
    items.push({ text, name, ...(role ? { role } : {}) });
  }

  return items;
}

export function TestimonialsSection({
  testimonialsSection,
  className,
}: TestimonialsSectionProps) {
  const { site, testimonials: siteTestimonials } = useWebBuilder();

  const theme = useEditorialTheme();
  const primaryColor = theme.primary;

  const resolvedTitle = useMemo(() => {
    const fromSection = tiptapToText(testimonialsSection?.title);
    if (fromSection) return fromSection;
    if (siteTestimonials?.title?.trim()) return siteTestimonials.title.trim();
    return 'What Our Clients Say';
  }, [testimonialsSection?.title, siteTestimonials?.title]);

  const items = useMemo(
    () => mapTestimonials(testimonialsSection, siteTestimonials),
    [testimonialsSection, siteTestimonials]
  );

  const [active, setActive] = useState(0);
  const [listExpanded, setListExpanded] = useState(false);

  const INITIAL_VISIBLE = 4;
  const hasMoreTestimonials = items.length > INITIAL_VISIBLE;
  const visibleItems = listExpanded ? items : items.slice(0, INITIAL_VISIBLE);

  const { ref: triggerRef, isVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.12,
  });
  const loaded = isVisible;

  const current = items[active] || items[0];

  if (testimonialsSection?.enabled === false) return null;
  if (!items.length) return null;

  return (
    <section id="testimonials" className={cn(SECTION.wrap, className)}>
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
              Client Stories
            </p>
            <AnimatedHeading
              title={resolvedTitle}
              loaded={loaded}
              baseDelay={0.2}
              lightSweep
            />
          </div>
        </div>

        <div
          className={`${SECTION.content} grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start`}
        >
          <div className="lg:col-span-4">
            <div
              className="divide-y border-y"
              style={{ borderColor: themeSurface(primaryColor, 0.22) }}
            >
              {visibleItems.map((item, index) => {
                const isActive = active === index;
                return (
                  <button
                    key={`${item.name}-${index}`}
                    type="button"
                    onClick={() => setActive(index)}
                    className="flex w-full items-center gap-4 py-4 text-left transition-all duration-300"
                    style={{
                      paddingLeft: isActive ? 16 : 0,
                      backgroundColor: isActive
                        ? themeSurface(primaryColor, 0.1)
                        : 'transparent',
                      borderLeft: isActive
                        ? `2px solid ${primaryColor}`
                        : '2px solid transparent',
                    }}
                  >
                    <span
                      className="shrink-0 text-sm tabular-nums"
                      style={{
                        fontFamily: 'var(--wb-body-font, sans-serif)',
                        opacity: isActive ? 1 : 0.4,
                        color: primaryColor,
                      }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span
                      className="min-w-0 flex-1 text-base transition-all duration-300"
                      style={{
                        fontFamily: 'var(--wb-heading-font, Georgia, serif)',
                        fontWeight: isActive ? 700 : 500,
                        color: 'var(--wb-text-main)',
                      }}
                    >
                      {item.name}
                    </span>
                    {isActive && (
                      <span
                        className="shrink-0 text-sm transition-transform duration-300"
                        style={{
                          fontFamily: 'var(--wb-body-font, sans-serif)',
                          color: primaryColor,
                        }}
                        aria-hidden="true"
                      >
                        →
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {hasMoreTestimonials && (
              <button
                type="button"
                onClick={() => setListExpanded((prev) => !prev)}
                aria-expanded={listExpanded}
                aria-label={listExpanded ? 'Show fewer testimonials' : 'Show more testimonials'}
                className="mt-4 flex w-full items-center justify-between border px-4 py-3 text-left text-sm transition-opacity hover:opacity-70"
                style={{
                  borderColor: themeSurface(primaryColor, 0.22),
                  fontFamily: 'var(--wb-body-font, sans-serif)',
                  color: 'var(--wb-text-main)',
                }}
              >
                <span>{listExpanded ? 'Show less' : 'Show more testimonials'}</span>
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

          <div
            className="lg:col-span-8 border p-6 md:p-8 bg-[color-mix(in_srgb,var(--wb-card-bg-light)_70%,transparent)]"
            style={{
              borderColor: themeSurface(primaryColor, 0.22),
              borderLeftWidth: 3,
              borderLeftColor: primaryColor,
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'translateY(0)' : 'translateY(24px)',
              transition: `opacity 0.8s ${EASE}, transform 0.8s ${EASE}`,
              transitionDelay: '0.6s',
            }}
          >
            <p
              className="text-[var(--wb-text-secondary)] text-sm mb-4"
              style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
            >
              ★★★★★
            </p>
            <blockquote
              className="text-xl md:text-2xl leading-relaxed text-[var(--wb-text-main)]"
              style={{ fontFamily: 'var(--wb-heading-font, Georgia, serif)' }}
            >
              &ldquo;{current?.text}&rdquo;
            </blockquote>
            <footer className="mt-8">
              <div
                className="font-medium text-[var(--wb-text-main)]"
                style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
              >
                {current?.name}
              </div>
              {current?.role && (
                <div
                  className="text-sm text-[var(--wb-text-secondary)]"
                  style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
                >
                  {current.role}
                </div>
              )}
            </footer>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
