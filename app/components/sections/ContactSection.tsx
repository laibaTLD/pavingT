'use client';

import { useState } from 'react';
import type { Page, BusinessHours } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { tiptapToText } from '@/app/lib/seo';
import { cn } from '@/app/lib/utils';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { AnimatedHeading, EASE } from '@/components/AnimatedTitle';
import { EditorialBackdrop, SECTION, SectionRail, SectionTopAccent } from '@/components/EditorialSection';
import { themeSurface } from '@/lib/theme';
import { useEditorialTheme } from '@/hooks/useEditorialTheme';
import { ContactSideForm } from '@/app/components/ui/ContactSideForm';

const DAY_LABELS: Record<string, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

interface ContactSectionProps {
  contactSection?: Page['contactSection'];
  className?: string;
}

function formatTime(time: string, displayFormat?: string) {
  if (!time) return '';
  if (displayFormat === '12h') {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }
  return time;
}

function formatDayHours(dayHours: BusinessHours, displayFormat?: string) {
  if (!dayHours.isOpen) return 'Closed';
  if (dayHours.is24Hours) return '24h';
  if (dayHours.timeRanges?.length) {
    return dayHours.timeRanges
      .map((range) => `${formatTime(range.openTime, displayFormat)} - ${formatTime(range.closeTime, displayFormat)}`)
      .join(', ');
  }
  return '';
}

export function ContactSection({ contactSection, className }: ContactSectionProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { site } = useWebBuilder();

  const theme = useEditorialTheme();
  const primaryColor = theme.primary;

  const { ref: triggerRef, isVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.12,
  });
  const loaded = isVisible;

  if (!contactSection?.enabled) return null;

  const business = site?.business;
  const address = business?.address;
  const businessHours = business?.businessHours;
  const showForm = contactSection.showForm !== false;
  const showMap = contactSection.showMap !== false;
  const showContactInfo = contactSection.showContactInfo !== false;

  const resolvedTitle =
    tiptapToText(contactSection.title) || 'Any questions? Simply ask us.';
  const resolvedDescription = tiptapToText(contactSection.description);

  const addressLine = [address?.street, address?.city, address?.state, address?.zipCode]
    .filter(Boolean)
    .join(', ');

  const hasInfoBlock = showContactInfo || showMap;

  return (
    <section id="contact" className={cn(SECTION.wrap, className)}>
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
              Contact
            </p>
            <AnimatedHeading
              title={resolvedTitle}
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
            {showForm && (
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="group mt-8 inline-flex items-center gap-2 border px-6 py-3 text-sm text-[var(--wb-text-main)] transition-colors duration-300 hover:bg-[var(--wb-card-bg-light)]"
                style={{
                  fontFamily: 'var(--wb-body-font, sans-serif)',
                  borderColor: themeSurface(primaryColor, 0.35),
                  opacity: loaded ? 1 : 0,
                  transform: loaded ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity 0.6s ${EASE}, transform 0.6s ${EASE}, background-color 0.3s ease`,
                  transitionDelay: '1s',
                }}
              >
                Open Contact Form
                <span
                  className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  →
                </span>
              </button>
            )}
          </div>
          <div className="hidden lg:flex lg:col-span-4 lg:justify-end lg:pt-2">
            <SectionRail index="13" loaded={loaded} primaryColor={primaryColor} />
          </div>
        </div>

        <ContactSideForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />

        {hasInfoBlock && (
          <div
            className={`${SECTION.content} grid grid-cols-1 gap-0 border-t lg:grid-cols-2`}
            style={{
              borderColor: themeSurface(primaryColor, 0.2),
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'translateY(0)' : 'translateY(24px)',
              transition: `opacity 0.8s ${EASE}, transform 0.8s ${EASE}`,
              transitionDelay: '0.6s',
            }}
          >
            {showContactInfo && (
              <div
                className="grid grid-cols-1 border-l sm:grid-cols-2"
                style={{ borderColor: themeSurface(primaryColor, 0.2) }}
              >
                {(address?.street || address?.city) && (
                  <div
                    className="border-r border-b bg-[color-mix(in_srgb,var(--wb-card-bg-light)_60%,transparent)] p-6 md:p-8 sm:col-span-2"
                    style={{ borderColor: themeSurface(primaryColor, 0.2) }}
                  >
                    <span
                      className="text-[11px] font-medium uppercase tracking-[0.22em]"
                      style={{
                        fontFamily: 'var(--wb-body-font, sans-serif)',
                        color: primaryColor,
                      }}
                    >
                      Head Office
                    </span>
                    <p
                      className={`mt-4 ${SECTION.body}`}
                      style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
                    >
                      {address?.street && (
                        <>
                          {address.street}
                          <br />
                        </>
                      )}
                      {[address?.city, address?.state, address?.zipCode]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                    {addressLine && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLine)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group mt-5 inline-flex items-center gap-2 text-sm transition-transform duration-300 hover:-translate-y-0.5"
                        style={{
                          fontFamily: 'var(--wb-body-font, sans-serif)',
                          color: primaryColor,
                        }}
                      >
                        View Map
                        <span aria-hidden="true">→</span>
                      </a>
                    )}
                  </div>
                )}

                {business?.phone && (
                  <div
                    className="border-r border-b bg-[color-mix(in_srgb,var(--wb-card-bg-light)_60%,transparent)] p-6 md:p-8"
                    style={{ borderColor: themeSurface(primaryColor, 0.2) }}
                  >
                    <span
                      className="text-[11px] font-medium uppercase tracking-[0.22em]"
                      style={{
                        fontFamily: 'var(--wb-body-font, sans-serif)',
                        color: primaryColor,
                      }}
                    >
                      Phone
                    </span>
                    <a
                      href={`tel:${business.phone.replace(/\s/g, '')}`}
                      className={`mt-4 block ${SECTION.body} transition-opacity hover:opacity-70`}
                      style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
                    >
                      {business.phone}
                    </a>
                  </div>
                )}

                {business?.email && (
                  <div
                    className="border-r border-b bg-[color-mix(in_srgb,var(--wb-card-bg-light)_60%,transparent)] p-6 md:p-8"
                    style={{ borderColor: themeSurface(primaryColor, 0.2) }}
                  >
                    <span
                      className="text-[11px] font-medium uppercase tracking-[0.22em]"
                      style={{
                        fontFamily: 'var(--wb-body-font, sans-serif)',
                        color: primaryColor,
                      }}
                    >
                      Email
                    </span>
                    <a
                      href={`mailto:${business.email}`}
                      className={`mt-4 block break-all ${SECTION.body} transition-opacity hover:opacity-70`}
                      style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
                    >
                      {business.email}
                    </a>
                  </div>
                )}

                {businessHours?.isEnabled && (
                  <div
                    className="border-r border-b bg-[color-mix(in_srgb,var(--wb-card-bg-light)_60%,transparent)] p-6 md:p-8 sm:col-span-2"
                    style={{ borderColor: themeSurface(primaryColor, 0.2) }}
                  >
                    <span
                      className="text-[11px] font-medium uppercase tracking-[0.22em]"
                      style={{
                        fontFamily: 'var(--wb-body-font, sans-serif)',
                        color: primaryColor,
                      }}
                    >
                      Business Hours
                    </span>
                    <div className="mt-4 space-y-2">
                      {businessHours.hours.map((day) => (
                        <div
                          key={day.day}
                          className={`flex justify-between gap-4 ${SECTION.body}`}
                          style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
                        >
                          <span className="font-medium text-[var(--wb-text-main)]">
                            {DAY_LABELS[day.day]}
                          </span>
                          <span>
                            {formatDayHours(day, businessHours.displayFormat)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {showMap && (
              <div
                className="relative min-h-[280px] border-l border-r"
                style={{ borderColor: themeSurface(primaryColor, 0.2) }}
              >
                {site?.business?.coordinates?.latitude != null &&
                site?.business?.coordinates?.longitude != null ? (
                  <iframe
                    title="Office Location"
                    width="100%"
                    height="100%"
                    className="absolute inset-0 h-full w-full border-0 grayscale contrast-[1.05] opacity-90 transition-all duration-700 hover:grayscale-0"
                    src={`https://maps.google.com/maps?q=${site.business.coordinates.latitude},${site.business.coordinates.longitude}&z=15&output=embed`}
                    allowFullScreen
                    loading="lazy"
                  />
                ) : (
                  <div
                    className={`flex h-full min-h-[280px] items-center justify-center ${SECTION.body}`}
                    style={{
                      fontFamily: 'var(--wb-body-font, sans-serif)',
                      background: themeSurface(primaryColor, 0.06),
                    }}
                  >
                    Map coordinates not configured
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default ContactSection;
