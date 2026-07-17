'use client';

import { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { OptimizedImage, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { AnimatedHeading, EASE } from '@/components/AnimatedTitle';
import { EditorialBackdrop, SECTION, SectionRail, SectionTopAccent } from '@/components/EditorialSection';
import { GALLERY_IMAGES } from '@/app/lib/galleryImages';
import { themeSurface } from '@/lib/theme';
import { useEditorialTheme } from '@/hooks/useEditorialTheme';

export function HardcodedGalleryGrid() {
  const theme = useEditorialTheme();
  const primaryColor = theme.primary;
  const borderTint = themeSurface(primaryColor, 0.2);

  const { ref: triggerRef, isVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.08,
  });
  const loaded = isVisible;

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const closeLightbox = useCallback(() => setActiveIndex(null), []);

  const showPrev = useCallback(() => {
    setActiveIndex((i) =>
      i === null ? null : (i - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length
    );
  }, []);

  const showNext = useCallback(() => {
    setActiveIndex((i) => (i === null ? null : (i + 1) % GALLERY_IMAGES.length));
  }, []);

  useEffect(() => {
    if (activeIndex === null) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [activeIndex, closeLightbox, showPrev, showNext]);

  const active = activeIndex !== null ? GALLERY_IMAGES[activeIndex] : null;

  return (
    <>
      <section id="gallery-grid" className={SECTION.wrap}>
        <EditorialBackdrop primaryColor={primaryColor} />
        <SectionTopAccent primaryColor={primaryColor} />

        <div ref={triggerRef} className={SECTION.container}>
          <div className={SECTION.header}>
            <div className="min-w-0 lg:col-span-8">
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
                Portfolio
              </p>
              <AnimatedHeading
                title="Selected Work"
                loaded={loaded}
                baseDelay={0.2}
                lightSweep
              />
              <p
                className={`mt-6 max-w-xl ${SECTION.body}`}
                style={{
                  fontFamily: 'var(--wb-body-font, sans-serif)',
                  opacity: loaded ? 1 : 0,
                  transform: loaded ? 'translateY(0)' : 'translateY(24px)',
                  transition: `opacity 0.8s ${EASE}, transform 0.8s ${EASE}`,
                  transitionDelay: '0.7s',
                }}
              >
                A look at finished paving, driveways, and outdoor surfaces from recent projects.
              </p>
            </div>
            <div className="hidden lg:col-span-4 lg:flex lg:justify-end lg:pt-2">
              <SectionRail index="01" loaded={loaded} primaryColor={primaryColor} />
            </div>
          </div>

          <div className={`${SECTION.content} grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5`}>
            {GALLERY_IMAGES.map((img, index) => (
              <button
                key={img.src}
                type="button"
                onClick={() => setActiveIndex(index)}
                className="group relative aspect-[4/5] w-full overflow-hidden text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  border: `1px solid ${borderTint}`,
                  outlineColor: primaryColor,
                  opacity: loaded ? 1 : 0,
                  transform: loaded ? 'translateY(0)' : 'translateY(28px)',
                  transition: `opacity 0.7s ${EASE}, transform 0.7s ${EASE}`,
                  transitionDelay: `${0.35 + Math.min(index, 11) * 0.05}s`,
                }}
                aria-label={`View ${img.alt}`}
              >
                <OptimizedImage
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  sizes={IMAGE_SIZES.galleryTile}
                />
                <span
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: themeSurface(primaryColor, 0.12) }}
                  aria-hidden
                />
                <span
                  className="pointer-events-none absolute bottom-3 left-3 text-[10px] uppercase tracking-[0.22em] opacity-0 transition-opacity duration-300 group-hover:opacity-80"
                  style={{
                    fontFamily: 'var(--wb-body-font, sans-serif)',
                    color: 'var(--wb-text-on-dark, #fff)',
                  }}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {active && activeIndex !== null && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-[color-mix(in_srgb,var(--wb-text-main)_78%,transparent)] p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Gallery image"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-10 border border-white/30 bg-black/40 p-2 text-white transition-opacity hover:opacity-80 sm:right-6 sm:top-6"
            aria-label="Close"
          >
            <X size={20} strokeWidth={1.5} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              showPrev();
            }}
            className="absolute left-2 z-10 hidden border border-white/25 bg-black/35 px-3 py-6 text-white/90 transition-opacity hover:opacity-80 sm:left-4 sm:block md:left-8"
            aria-label="Previous image"
          >
            ←
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              showNext();
            }}
            className="absolute right-2 z-10 hidden border border-white/25 bg-black/35 px-3 py-6 text-white/90 transition-opacity hover:opacity-80 sm:right-4 sm:block md:right-8"
            aria-label="Next image"
          >
            →
          </button>

          <div
            className="relative max-h-[85vh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative mx-auto aspect-[4/5] w-full max-h-[85vh] overflow-hidden sm:aspect-[16/10]">
              <OptimizedImage
                src={active.src}
                alt={active.alt}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 1024px"
                priority
              />
            </div>
            <p
              className="mt-3 text-center text-[10px] uppercase tracking-[0.28em] text-white/70"
              style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
            >
              {String(activeIndex + 1).padStart(2, '0')} / {String(GALLERY_IMAGES.length).padStart(2, '0')}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default HardcodedGalleryGrid;
