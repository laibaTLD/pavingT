'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getPageHref } from '@/app/lib/siteContent';
import { tiptapToText } from '@/app/lib/seo';
import { cn, getImageSrc } from '@/app/lib/utils';
import { OptimizedImage, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { AnimatedHeading, EASE } from '@/components/AnimatedTitle';
import { EditorialBackdrop, SECTION, SectionTopAccent } from '@/components/EditorialSection';
import { GALLERY_IMAGES } from '@/app/lib/galleryImages';
import { themeSurface } from '@/lib/theme';
import { useEditorialTheme } from '@/hooks/useEditorialTheme';

interface GallerySectionProps {
  gallerySection?: Page['gallerySection'];
  className?: string;
}

type GalleryImage = {
  id: string;
  imageUrl: string;
  altText: string;
};

type GallerySectionImages = NonNullable<Page['gallerySection']>['images'];

/** Embla disables loop unless slide content is wider than the viewport — pad copies. */
const MIN_LOOP_SLIDES = 8;

function mapGalleryImages(images: GallerySectionImages | undefined): GalleryImage[] {
  if (!images?.length) return [];

  return images
    .map((img, index) => {
      const imageUrl = img.url ? getImageSrc(img.url) : '';
      if (!imageUrl) return null;

      const caption = tiptapToText(img.caption);
      const altText = img.altText?.trim() || caption || 'Gallery image';

      return {
        id: `${imageUrl}-${index}`,
        imageUrl,
        altText,
      };
    })
    .filter((img): img is GalleryImage => img !== null);
}

function mapHardcodedImages(): GalleryImage[] {
  return GALLERY_IMAGES.map((img, index) => ({
    id: `hardcoded-${index}`,
    imageUrl: img.src,
    altText: img.alt,
  }));
}

function buildLoopSlides(images: GalleryImage[]): GalleryImage[] {
  if (images.length === 0) return [];
  if (images.length >= MIN_LOOP_SLIDES) return images;

  const copies = Math.ceil(MIN_LOOP_SLIDES / images.length);
  const slides: GalleryImage[] = [];
  for (let copy = 0; copy < copies; copy++) {
    for (const img of images) {
      slides.push({
        ...img,
        id: `${img.id}-loop-${copy}`,
      });
    }
  }
  return slides;
}

export function GallerySection({ gallerySection, className }: GallerySectionProps) {
  const { pages } = useWebBuilder();

  const theme = useEditorialTheme();
  const primaryColor = theme.primary;

  const resolvedTitle = useMemo(
    () => tiptapToText(gallerySection?.title) || 'Our Portfolio',
    [gallerySection?.title]
  );

  const resolvedDescription = useMemo(
    () => tiptapToText(gallerySection?.description),
    [gallerySection?.description]
  );

  const galleryImages = useMemo(() => {
    const fromBuilder = mapGalleryImages(gallerySection?.images);
    return fromBuilder.length > 0 ? fromBuilder : mapHardcodedImages();
  }, [gallerySection?.images]);

  const loopSlides = useMemo(() => buildLoopSlides(galleryImages), [galleryImages]);

  const galleryHref = useMemo(() => {
    const galleryPage = pages.find(
      (p) => (p.slug || '').replace(/^\/+|\/+$/g, '').toLowerCase() === 'gallery'
    );
    return galleryPage ? getPageHref(galleryPage) : '/gallery';
  }, [pages]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    containScroll: false,
    slidesToScroll: 1,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi || galleryImages.length === 0) return;
    setSelectedIndex(emblaApi.selectedScrollSnap() % galleryImages.length);
  }, [emblaApi, galleryImages.length]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Re-init when slide set changes so loop math recalculates
  useEffect(() => {
    emblaApi?.reInit();
  }, [emblaApi, loopSlides.length]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  const { ref: triggerRef, isVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.12,
  });
  const loaded = isVisible;

  if (gallerySection?.enabled === false) return null;
  if (!galleryImages.length) return null;

  const borderColor = themeSurface(primaryColor, 0.2);
  const showControls = galleryImages.length > 1;

  return (
    <section id="gallery" className={cn(SECTION.wrap, className)}>
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
              Portfolio
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
          className={SECTION.content}
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(20px)',
            transition: `opacity 0.8s ${EASE}, transform 0.8s ${EASE}`,
            transitionDelay: '0.45s',
          }}
        >
          <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {loopSlides.map((img) => (
                  <article
                    key={img.id}
                    className="relative mr-4 min-w-0 shrink-0 grow-0 basis-[min(78vw,280px)] overflow-hidden bg-[var(--wb-card-bg-light)] shadow-[0_16px_40px_color-mix(in_srgb,var(--wb-text-main)_8%,transparent)] sm:basis-[min(60vw,280px)] md:mr-6 md:basis-[min(28vw,320px)]"
                    style={{ border: `1px solid ${borderColor}` }}
                  >
                    <div className="relative aspect-[4/5] w-full">
                      <OptimizedImage
                        src={img.imageUrl}
                        alt={img.altText}
                        fill
                        className="object-cover"
                        sizes={IMAGE_SIZES.galleryTile}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {showControls && (
              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={scrollPrev}
                    aria-label="Previous gallery images"
                    className="inline-flex h-10 w-10 items-center justify-center border text-[var(--wb-text-main)] transition-colors hover:border-[var(--wb-primary)] hover:text-[var(--wb-primary)]"
                    style={{ borderColor }}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={scrollNext}
                    aria-label="Next gallery images"
                    className="inline-flex h-10 w-10 items-center justify-center border text-[var(--wb-text-main)] transition-colors hover:border-[var(--wb-primary)] hover:text-[var(--wb-primary)]"
                    style={{ borderColor }}
                  >
                    →
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  {galleryImages.map((img, index) => (
                    <button
                      key={`dot-${img.id}`}
                      type="button"
                      aria-label={`Go to slide ${index + 1}`}
                      aria-current={index === selectedIndex}
                      onClick={() => scrollTo(index)}
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: index === selectedIndex ? '1.25rem' : '0.375rem',
                        backgroundColor:
                          index === selectedIndex
                            ? primaryColor
                            : themeSurface(primaryColor, 0.28),
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <Link
              href={galleryHref}
              className="group inline-flex items-center gap-2 text-sm transition-transform duration-300 hover:-translate-y-0.5"
              style={{
                fontFamily: 'var(--wb-body-font, sans-serif)',
                color: primaryColor,
              }}
            >
              See More Work
              <span
                className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default GallerySection;
