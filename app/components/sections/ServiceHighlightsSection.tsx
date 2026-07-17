'use client';

import React, { useMemo, useEffect, useRef } from 'react';
import { Page } from '@/app/lib/types';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { cn } from '@/app/lib/utils';
import { useThemeColors } from '@/app/hooks/useTheme';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ServiceHighlightsSectionProps {
  serviceHighlightsSection: Page['serviceHighlightsSection'];
  className?: string;
}

export const ServiceHighlightsSection: React.FC<ServiceHighlightsSectionProps> = ({
  serviceHighlightsSection,
  className
}) => {
  const themeColors = useThemeColors();
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isEnabled = serviceHighlightsSection?.enabled === true || serviceHighlightsSection != null;
    if (!isEnabled) return;

    const ctx = gsap.context(() => {
      // 1. Headline Reveal
      gsap.fromTo(headlineRef.current?.children || [],
        { y: 30, opacity: 0 },
        { 
          y: 0, opacity: 1, 
          stagger: 0.1, 
          duration: 1, 
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headlineRef.current,
            start: 'top 90%',
          }
        }
      );

      // 2. Highlights Items Reveal & Counter
      const items = gridRef.current?.querySelectorAll('.highlight-item');
      if (items) {
        items.forEach((item) => {
          const numberObj = { val: 0 };
          const numberEl = item.querySelector('.big-number');
          const targetValue = parseInt(numberEl?.getAttribute('data-value') || '0', 10);
          const suffix = numberEl?.getAttribute('data-suffix') || '';

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: item,
              start: 'top 90%',
            }
          });

          tl.fromTo(item,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
          );

          if (!isNaN(targetValue) && numberEl) {
            tl.to(numberObj, {
              val: targetValue,
              duration: 2.5,
              ease: 'power2.out',
              onUpdate: () => {
                const formatted = Math.round(numberObj.val).toLocaleString();
                numberEl.textContent = formatted + suffix;
              }
            }, "-=0.6");
          }
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [serviceHighlightsSection]);

  const isEnabled = serviceHighlightsSection?.enabled === true || serviceHighlightsSection != null;
  if (!isEnabled) return null;

  const brandColor = themeColors.primaryButton;
  const primaryTextColor = themeColors.lightPrimaryText;
  const secondaryTextColor = themeColors.lightSecondaryText;

  const highlights = [...(serviceHighlightsSection.highlights || [])]
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .slice(0, 4);

  const parseCounter = (raw: unknown) => {
    if (typeof raw !== 'string') return null;
    const s = raw.trim();
    const match = s.match(/([0-9][0-9,\.]*)(\+?)/);
    if (!match) return null;
    const valueStr = match[1].replace(/,/g, '');
    const value = parseInt(valueStr, 10);
    return isNaN(value) ? null : { value, suffix: match[2] || '' };
  };

  return (
    <section
      ref={sectionRef}
      className={cn('relative py-3 md:py-8 lg:py-12 overflow-hidden', className)}
      style={{ backgroundColor: themeColors.pageBackground }}
    >
      <div className="mx-auto w-full max-w-[1800px] px-5 sm:px-8 md:px-16 lg:px-24">
        
        {/* Header Area */}
        <div ref={headlineRef} className="mb-10 sm:mb-12 lg:mb-22">
           <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-[1.5px]" style={{ backgroundColor: brandColor }} />
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase" style={{ color: primaryTextColor }}>
                 Highlights
              </span>
           </div>
           {serviceHighlightsSection.title && (
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-sans tracking-tight uppercase font-light leading-none break-words">
                 <div className="[&_p:first-child]:text-primary [&_span:first-of-type]:text-primary" style={{ color: primaryTextColor }}>
                   {/* Hierarchical styling to match image: First line Red, Subtitle Black */}
                   <style jsx>{`
                     h2 :global(p:first-child), h2 :global(span:first-child) {
                        color: ${brandColor} !important;
                     }
                   `}</style>
                   <TiptapRenderer content={serviceHighlightsSection.title} as="inline" />
                </div>
              </h2>
           )}
        </div>

        {/* Highlights Display - Using Brand Color for High Impact Data */}
        <div ref={gridRef} className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-12 xl:gap-x-16">
          {highlights.map((highlight, index) => {
            const counter = parseCounter((highlight as any).price);

            return (
              <div key={index} className="highlight-item group flex min-w-0 flex-col">
                <div className="relative mb-6 sm:mb-8">
                  <div 
                     className="big-number text-4xl font-extralight leading-none tracking-[0.08em] sm:text-5xl md:text-6xl lg:text-[clamp(2.5rem,5vw,5.5rem)]"
                     data-value={counter?.value || 0}
                     data-suffix={counter?.suffix || ''}
                     style={{ color: brandColor }} // High Impact Brand Color as per image design
                  >
                     {counter ? '0' : ((highlight as any).price || '—')}
                  </div>
                  <div 
                    className="w-12 h-[1px] opacity-20 transition-all duration-700 group-hover:w-full group-hover:bg-primary"
                    style={{ backgroundColor: brandColor }}
                  />
                </div>

                <div className="min-w-0">
                  {highlight.title && (
                    <h4 className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.4em] leading-tight break-words" style={{ color: primaryTextColor }}>
                      <TiptapRenderer content={highlight.title} as="inline" />
                    </h4>
                  )}
                  {highlight.description && (
                    <div className="mt-2 max-w-full text-[10px] font-light uppercase leading-relaxed tracking-[0.1em] opacity-60 md:text-[11px] md:max-w-[240px]" style={{ color: secondaryTextColor }}>
                      <TiptapRenderer content={highlight.description} as="inline" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServiceHighlightsSection;