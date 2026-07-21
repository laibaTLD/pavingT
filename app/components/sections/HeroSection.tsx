'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { tiptapToText, tiptapToLines } from '@/app/lib/seo';
import { getPrimaryHeroImageFromHero } from '@/app/lib/siteContent';
import { resolvePrimaryCta } from '@/app/components/ui/made';
import { cn, getImageSrc } from '@/app/lib/utils';
import { EASE, ENTRANCE, splitTitleLines, TitlePart } from '@/components/AnimatedTitle';
import { getHighResImageUrl, HERO_IMAGE_QUALITY, HERO_IMAGE_SIZES } from '@/lib/images';
import { OptimizedImage } from '@/app/components/ui/OptimizedImage';
import { useParallaxMouse } from '@/hooks/useParallaxMouse';
import { useEditorialTheme } from '@/hooks/useEditorialTheme';
import { themeSurface } from '@/lib/theme';

interface HeroSectionProps {
  hero?: Page['hero'];
  page?: Page | null;
  className?: string;
  title?: string;
  description?: string;
  ctaButton?: { href: string; label: string };
  backgroundImage?: string;
  /** When true, skip scale/parallax zoom so the hero photo stays sharp (service areas). */
  preserveImageQuality?: boolean;
}

function FloatingParticles({
  mouseX,
  mouseY,
  primaryColor,
}: {
  mouseX: number;
  mouseY: number;
  primaryColor: string;
}) {
  const particles = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        left: `${8 + ((i * 17) % 84)}%`,
        top: `${12 + ((i * 23) % 76)}%`,
        size: i % 3 === 0 ? 3 : 2,
        duration: 4 + (i % 5),
        delay: (i % 7) * 0.4,
      })),
    []
  );

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[5] mix-blend-screen opacity-40"
      style={{
        transform: `translate3d(${mouseX * 30}px, ${mouseY * 30}px, 0)`,
        transition: 'transform 0.15s ease-out',
      }}
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full animate-hero-particle-float"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            backgroundColor: themeSurface(primaryColor, 0.7),
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function resolveHeroImage(hero?: Page['hero']): string {
  const fromHelper = getPrimaryHeroImageFromHero(hero);
  if (fromHelper) return fromHelper;
  const media = hero?.media;
  if (media?.url) return getImageSrc(media.url);
  const bg = (hero as Page['hero'] & { backgroundImage?: string | { url?: string } })
    ?.backgroundImage;
  if (typeof bg === 'string' && bg.trim()) return getImageSrc(bg.trim());
  if (bg && typeof bg === 'object' && bg.url) return getImageSrc(bg.url);
  return '';
}

function resolveCardCopy(hero?: Page['hero']) {
  const cardTitle =
    tiptapToText(hero?.eyebrow) ||
    tiptapToText(hero?.featuredSpotlight?.label) ||
    '';

  const spotlight = hero?.featuredSpotlight;
  const spotlightBody = [spotlight?.projectName, spotlight?.completedLabel]
    .filter(Boolean)
    .join(' · ');

  const cardDescription =
    tiptapToText(hero?.subtitle) ||
    spotlightBody ||
    tiptapToText(hero?.description) ||
    '';

  return { cardTitle, cardDescription };
}

export function HeroSection({
  hero,
  page,
  className,
  title,
  description,
  ctaButton,
  backgroundImage,
  preserveImageQuality = false,
}: HeroSectionProps) {
  const { site, pages } = useWebBuilder();
  const theme = useEditorialTheme();

  const titleLines = useMemo(() => {
    if (title) return splitTitleLines(title);
    const fromBuilder = tiptapToLines(hero?.title, 4);
    if (fromBuilder.length) return fromBuilder;
    return splitTitleLines('Fantasy Lands');
  }, [hero?.title, title]);

  const resolvedTitle = titleLines.join(' ');
  const resolvedDescription =
    description ||
    tiptapToText(hero?.description) ||
    '';

  const resolvedCta =
    ctaButton ||
    resolvePrimaryCta(page, site, pages) ||
    (hero?.primaryCta?.label && hero?.primaryCta?.href
      ? { label: hero.primaryCta.label, href: hero.primaryCta.href }
      : { href: '#contact', label: 'watch' });

  const { cardTitle, cardDescription } = useMemo(() => resolveCardCopy(hero), [hero]);

  const resolvedBackgroundImage =
    backgroundImage || resolveHeroImage(hero) || undefined;
  const heroSrc = resolvedBackgroundImage
    ? getHighResImageUrl(resolvedBackgroundImage, 1920)
    : null;
  const heroAlt =
    hero?.media?.altText ||
    hero?.mediaItems?.[0]?.altText ||
    tiptapToText(hero?.title) ||
    'Hero';

  const titleSizeClass =
    resolvedTitle.length > 45
      ? 'text-[clamp(1.25rem,3.2vw,2rem)]'
      : resolvedTitle.length > 30
        ? 'text-[clamp(1.35rem,3.6vw,2.25rem)]'
        : 'text-[clamp(1.5rem,4vw,2.75rem)]';

  const sectionRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [ctaMagnet, setCtaMagnet] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);
  const anim = !reducedMotion;
  const mouse = useParallaxMouse(sectionRef, anim);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onMq = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onMq);

    const t = requestAnimationFrame(() => setLoaded(true));

    return () => {
      cancelAnimationFrame(t);
      mq.removeEventListener('change', onMq);
    };
  }, []);

  const handleCtaMove = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!ctaRef.current || reducedMotion) return;
      const rect = ctaRef.current.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;
      setCtaMagnet({
        x: (relX - rect.width / 2) * 0.12,
        y: (relY - rect.height / 2) * 0.12,
      });
    },
    [reducedMotion]
  );

  const resetCtaMagnet = useCallback(() => {
    setCtaMagnet({ x: 0, y: 0 });
  }, []);

  const textTransform = anim ? `translate3d(${mouse.x * 5}px, ${mouse.y * 5}px, 0)` : undefined;
  const imageTransform = preserveImageQuality
    ? undefined
    : anim
      ? loaded
        ? `translate3d(${mouse.x * 10}px, ${mouse.y * 10}px, 0) translateY(0) scale(1.02)`
        : 'translateY(30px) scale(0.96)'
      : undefined;
  const panelSlide = anim ? (loaded ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)';

  if (hero?.enabled === false) return null;

  return (
    <section
      ref={sectionRef}
      className={cn(
        'relative -mt-[var(--wb-header-height)] flex min-h-[100svh] flex-col overflow-hidden bg-[var(--wb-page-bg)]',
        'md:grid md:h-[100svh] md:max-h-[100svh] md:min-h-[100svh] md:grid-cols-[minmax(0,min(440px,38vw))_minmax(0,1fr)]',
        className
      )}
    >
      <div className="relative order-2 min-h-[min(52vh,420px)] flex-1 md:order-none md:col-start-2 md:h-full md:min-h-0">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="relative h-full w-full will-change-transform"
            style={{
              transform: imageTransform,
              transition: loaded
                ? 'transform 0.15s ease-out'
                : `transform ${ENTRANCE} ${EASE}`,
              transitionDelay: loaded ? '0s' : '0.5s',
            }}
          >
            {heroSrc ? (
              <OptimizedImage
                src={heroSrc}
                alt={heroAlt}
                fill
                priority
                quality={HERO_IMAGE_QUALITY}
                sizes={
                  preserveImageQuality
                    ? '(max-width: 768px) 100vw, (max-width: 1280px) 70vw, 1200px'
                    : HERO_IMAGE_SIZES
                }
                className="object-cover object-center"
              />
            ) : (
              <div className="h-full w-full bg-[var(--wb-page-bg)]" />
            )}
          </div>
          <div className="absolute inset-0 bg-[color-mix(in_srgb,var(--wb-page-bg)_10%,transparent)] md:bg-gradient-to-r md:from-[color-mix(in_srgb,var(--wb-page-bg)_5%,transparent)] md:via-transparent md:to-[color-mix(in_srgb,var(--wb-page-bg)_20%,transparent)]" />
        </div>

        {heroSrc && anim && (
          <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to right, ${themeSurface(theme.pageBackground, 0.3)} 0%, transparent 50%, transparent 100%)`,
              }}
            />
          </div>
        )}

        {anim && (
          <div className="pointer-events-none absolute inset-0 z-[3]">
            <div
              className="absolute bottom-[18%] right-[12%] h-24 w-40 rounded-full blur-2xl"
              style={{ backgroundColor: themeSurface(theme.primary, 0.05) }}
            />
          </div>
        )}

        {anim && (
          <div className="pointer-events-none absolute inset-0 z-[4]">
            <FloatingParticles mouseX={mouse.x} mouseY={mouse.y} primaryColor={theme.primary} />
          </div>
        )}

        {(cardTitle || cardDescription) && (
        <div
          className="absolute bottom-0 right-0 z-10 w-full max-w-full bg-[var(--wb-page-bg)] px-5 py-5 sm:px-8 sm:py-6 md:w-[min(420px,36vw)] md:px-10 md:py-10"
          style={{
            opacity: loaded || reducedMotion ? 1 : 0,
            transform: loaded || reducedMotion ? 'translateY(0)' : 'translateY(24px)',
            transition: `transform ${ENTRANCE} ${EASE}, opacity ${ENTRANCE} ${EASE}`,
            transitionDelay: '1s',
          }}
        >
          {cardTitle && (
          <h2
            className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--wb-text-main)] break-words"
            style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
          >
            {cardTitle}
          </h2>
          )}
          {cardDescription && (
          <p
            className={cn(
              'text-sm leading-relaxed text-[var(--wb-text-secondary)] break-words md:text-[0.9375rem]',
              cardTitle && 'mt-3'
            )}
            style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
          >
            {cardDescription}
          </p>
          )}
        </div>
        )}
      </div>

      <div
        className="relative z-20 order-1 flex min-w-0 shrink-0 flex-col bg-[var(--wb-page-bg)] md:order-none md:col-start-1 md:row-start-1 md:h-full md:min-h-0"
        style={{
          transform: panelSlide,
          transition: `transform ${ENTRANCE} ${EASE}`,
          transitionDelay: loaded ? '0s' : '0.2s',
        }}
      >
        <span
          className="pointer-events-none absolute right-5 top-[calc(var(--wb-header-height)+0.5rem)] select-none text-[clamp(2rem,7vw,4rem)] font-normal leading-none text-[color-mix(in_srgb,var(--wb-text-main)_12%,transparent)] sm:right-8 lg:right-10"
          style={{ fontFamily: 'var(--wb-heading-font, Georgia, serif)' }}
          aria-hidden="true"
        >
          01
        </span>

        <div className="flex min-w-0 flex-col justify-center px-5 pb-8 pt-[calc(var(--wb-header-height)+1rem)] sm:px-8 md:min-h-0 md:flex-1 md:px-8 md:pb-10 lg:px-10">
          <div
            className="relative z-10 w-full max-w-md will-change-transform lg:max-w-lg"
            style={{ transform: textTransform, transition: 'transform 0.15s ease-out' }}
          >
            <h1
              className={`w-full break-words ${titleSizeClass} font-normal leading-[1.15] tracking-tight text-[var(--wb-text-main)]`}
            >
              {titleLines.map((line, index) => (
                <TitlePart
                  key={`${line}-${index}`}
                  text={line}
                  delay={0.4 + index * 0.2}
                  loaded={loaded || reducedMotion}
                  fromLeft={index % 2 === 0}
                />
              ))}
            </h1>

            {resolvedDescription && (
              <p
                className="mt-4 max-w-prose text-sm leading-relaxed text-[var(--wb-text-secondary)] break-words sm:mt-5 md:mt-6 md:text-[0.9375rem]"
                style={{
                  fontFamily: 'var(--wb-body-font, sans-serif)',
                  opacity: loaded || reducedMotion ? 1 : 0,
                  transform: loaded || reducedMotion ? 'translateY(0)' : 'translateY(16px)',
                  transition: `opacity 0.8s ${EASE}, transform 0.8s ${EASE}`,
                  transitionDelay: '0.6s',
                }}
              >
                {resolvedDescription}
              </p>
            )}

            <Link
              ref={ctaRef}
              href={resolvedCta.href}
              onMouseMove={handleCtaMove}
              onMouseLeave={resetCtaMagnet}
              className="relative z-10 mt-6 inline-flex max-w-full items-center gap-3 bg-[var(--wb-card-bg-light)] px-5 py-3 text-sm font-medium tracking-wide text-[var(--wb-text-main)] shadow-[0_8px_24px_color-mix(in_srgb,var(--wb-text-main)_12%,transparent)] transition-shadow duration-300 hover:shadow-[0_12px_40px_color-mix(in_srgb,var(--wb-primary)_25%,transparent)] sm:mt-8 sm:px-7 sm:py-3.5 md:mt-10"
              style={{
                fontFamily: 'var(--wb-body-font, sans-serif)',
                opacity: loaded || reducedMotion ? 1 : 0,
                transform:
                  loaded || reducedMotion
                    ? `translate(${Math.max(-8, Math.min(8, ctaMagnet.x))}px, ${Math.max(-6, Math.min(6, ctaMagnet.y))}px)`
                    : 'translateY(12px)',
                transition: loaded
                  ? 'transform 0.2s ease-out, opacity 0.5s ease, box-shadow 0.3s ease'
                  : `transform 0.6s ${EASE}, opacity 0.6s ${EASE}`,
                transitionDelay: loaded ? '0s' : '0.8s',
              }}
            >
              <span className="truncate">{resolvedCta.label}</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes hero-particle-float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-18px) translateX(6px);
            opacity: 0.9;
          }
        }
        .animate-hero-particle-float {
          animation: hero-particle-float ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-hero-particle-float {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}

export default HeroSection;
