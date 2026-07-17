'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getPageHref } from '@/app/lib/siteContent';
import { tiptapToText } from '@/app/lib/seo';
import { cn, getImageSrc } from '@/app/lib/utils';
import { OptimizedImage, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { AnimatedHeading, EASE } from '@/components/AnimatedTitle';
import { EditorialBackdrop, SECTION, SectionRail, SectionTopAccent } from '@/components/EditorialSection';
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

  const galleryHref = useMemo(() => {
    const galleryPage = pages.find(
      (p) => (p.slug || '').replace(/^\/+|\/+$/g, '').toLowerCase() === 'gallery'
    );
    return galleryPage ? getPageHref(galleryPage) : '/gallery';
  }, [pages]);

  const { ref: triggerRef, isVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.12,
  });
  const loaded = isVisible;

  // Hide only when explicitly disabled; otherwise show builder or hardcoded images
  if (gallerySection?.enabled === false) return null;
  if (!galleryImages.length) return null;

  return (
    <section id="gallery" className={cn(SECTION.wrap, className)}>
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
          <div className="hidden lg:flex lg:col-span-4 lg:justify-end lg:pt-2">
            <SectionRail index="08" loaded={loaded} primaryColor={primaryColor} />
          </div>
        </div>

        <div className={SECTION.content}>
          <div className="-mx-6 overflow-x-auto overscroll-x-contain px-6 pb-4 [scrollbar-width:thin] md:-mx-12 md:px-12 lg:-mx-16 lg:px-16 xl:-mx-20 xl:px-20">
            <div className="flex w-max gap-4 md:gap-6">
              {galleryImages.slice(0, 6).map((img, index) => (
                <article
                  key={img.id}
                  className="relative w-[min(78vw,280px)] shrink-0 overflow-hidden bg-[var(--wb-card-bg-light)] shadow-[0_16px_40px_color-mix(in_srgb,var(--wb-text-main)_8%,transparent)] sm:w-[min(60vw,280px)] md:w-[min(28vw,320px)]"
                  style={{
                    opacity: loaded ? 1 : 0,
                    transform: loaded ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.96)',
                    transition: `opacity 0.8s ${EASE}, transform 0.8s ${EASE}`,
                    transitionDelay: `${0.5 + index * 0.1}s`,
                    border: `1px solid ${themeSurface(primaryColor, 0.2)}`,
                  }}
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

          <div className="mt-8 flex justify-end">
            <Link
              href={galleryHref}
              className="group inline-flex items-center gap-2 text-sm transition-transform duration-300 hover:-translate-y-0.5"
              style={{
                fontFamily: 'var(--wb-body-font, sans-serif)',
                color: primaryColor,
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.6s ${EASE}, transform 0.6s ${EASE}`,
                transitionDelay: '1s',
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
