'use client';

import { useMemo, useState } from 'react';
import type { Page } from '@/app/lib/types';
import { tiptapToText } from '@/app/lib/seo';
import { cn } from '@/app/lib/utils';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { AnimatedHeading, EASE } from '@/components/AnimatedTitle';
import { EditorialBackdrop, SECTION, SectionTopAccent } from '@/components/EditorialSection';
import { themeSurface } from '@/lib/theme';
import { useEditorialTheme } from '@/hooks/useEditorialTheme';

interface FAQSectionProps {
  faqSection?: Page['faqSection'];
  className?: string;
}

export function FAQSection({ faqSection, className }: FAQSectionProps) {
  const theme = useEditorialTheme();
  const primaryColor = theme.primary;

  const resolvedTitle = useMemo(
    () => tiptapToText(faqSection?.title) || 'Frequently Asked Questions',
    [faqSection?.title]
  );

  const resolvedDescription = useMemo(
    () => tiptapToText(faqSection?.description),
    [faqSection?.description]
  );

  const questions = useMemo(
    () =>
      (faqSection?.items ?? [])
        .map((item) => ({
          question: tiptapToText(item.question),
          answer: tiptapToText(item.answer),
        }))
        .filter((item) => item.question || item.answer),
    [faqSection?.items]
  );

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const { ref: triggerRef, isVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.12,
  });
  const loaded = isVisible;

  if (!faqSection || faqSection.enabled === false) return null;
  if (!questions.length) return null;

  return (
    <section id="faq" className={cn(SECTION.wrap, className)}>
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
              FAQ
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
          </div>
        </div>

        <div
          className={`${SECTION.content} mx-auto max-w-3xl divide-y border-y`}
          style={{ borderColor: themeSurface(primaryColor, 0.22) }}
        >
          {questions.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <article
                key={index}
                style={{
                  backgroundColor: isOpen
                    ? themeSurface(primaryColor, 0.08)
                    : 'transparent',
                  borderLeft: isOpen
                    ? `2px solid ${primaryColor}`
                    : '2px solid transparent',
                  opacity: loaded ? 1 : 0,
                  transform: loaded ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity 0.7s ${EASE}, transform 0.7s ${EASE}, background-color 0.4s ease`,
                  transitionDelay: `${0.5 + index * 0.08}s`,
                }}
              >
                <button
                  type="button"
                  className="flex w-full items-start gap-6 py-5 text-left md:gap-8"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <span
                    className="shrink-0 text-sm tabular-nums"
                    style={{
                      fontFamily: 'var(--wb-body-font, sans-serif)',
                      color: primaryColor,
                      opacity: isOpen ? 1 : 0.45,
                    }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <span
                        className="text-base md:text-lg transition-all duration-300"
                        style={{
                          fontFamily: 'var(--wb-heading-font, Georgia, serif)',
                          fontWeight: isOpen ? 700 : 500,
                          color: 'var(--wb-text-main)',
                        }}
                      >
                        {faq.question}
                      </span>
                      <span
                        className="text-lg leading-none"
                        style={{ color: isOpen ? primaryColor : 'var(--wb-text-secondary)' }}
                      >
                        {isOpen ? '−' : '+'}
                      </span>
                    </div>
                    <div
                      className="overflow-hidden transition-all duration-500"
                      style={{ maxHeight: isOpen ? 240 : 0, opacity: isOpen ? 1 : 0 }}
                    >
                      <p
                        className={`mt-4 pr-4 ${SECTION.body}`}
                        style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
                      >
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
