'use client';

import React, { useMemo } from 'react';
import { tiptapToText } from '@/app/lib/seo';
import { cn } from '@/app/lib/utils';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { AnimatedHeading, EASE } from '@/components/AnimatedTitle';
import { EditorialBackdrop, SECTION, SectionTopAccent } from '@/components/EditorialSection';
import { useEditorialTheme } from '@/hooks/useEditorialTheme';

interface ServiceDetailsProps {
  details: unknown;
  className?: string;
}

type DetailsData = {
  title?: unknown;
  description?: unknown;
};

/**
 * Service Details on service-area pages: title + description only.
 * Does NOT render company-detail feature/process/benefit point cards.
 */
function normalizeDetailsSection(details: unknown): DetailsData | null {
  if (!details || typeof details !== 'object') return null;

  const data = details as Record<string, unknown>;
  if (data.enabled === false) return null;

  const title = data.title;
  const description = data.description ?? data.subtitle;

  if (!title && !description) return null;

  return { title, description };
}

export const ServiceDetails: React.FC<ServiceDetailsProps> = ({ details, className }) => {
  const theme = useEditorialTheme();
  const primaryColor = theme.primary;

  const section = useMemo(() => normalizeDetailsSection(details), [details]);

  const resolvedHeading = useMemo(
    () => tiptapToText(section?.title) || 'Service Details',
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
    <section id="service-details" className={cn(SECTION.wrap, className)}>
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
              <span className={SECTION.labelBar} style={{ backgroundColor: primaryColor }} />
              Service Details
            </p>
            <AnimatedHeading
              title={resolvedHeading}
              loaded={loaded}
              baseDelay={0.2}
              lightSweep
            />
            {resolvedDescription && (
              <p
                className={`mt-8 max-w-2xl ${SECTION.body}`}
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
      </div>
    </section>
  );
};

export default ServiceDetails;
