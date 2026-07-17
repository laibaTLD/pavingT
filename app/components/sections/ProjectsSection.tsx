'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { Page, Project } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getPageHref } from '@/app/lib/siteContent';
import { tiptapToText } from '@/app/lib/seo';
import { cn, getImageSrc } from '@/app/lib/utils';
import { OptimizedImage, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { AnimatedHeading, EASE, ENTRANCE } from '@/components/AnimatedTitle';
import { EditorialBackdrop, SECTION, SectionRail, SectionTopAccent } from '@/components/EditorialSection';
import { themeSurface } from '@/lib/theme';
import { useEditorialTheme } from '@/hooks/useEditorialTheme';

interface ProjectsSectionProps {
  projectSection?: Page['projectSection'];
  projectsSection?: Page['projectsSection'];
  className?: string;
  showViewAllLink?: boolean;
  projectsLimit?: number;
}

type ManualProject = NonNullable<NonNullable<Page['projectsSection']>['projects']>[number];
type DisplayItem = Project | ManualProject;

type ProjectSectionInput = Page['projectSection'] & {
  heading?: unknown;
  subtitle?: unknown;
};

type ProjectCard = {
  key: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  year: string;
  href: string;
};

function pickSectionField(
  section: ProjectSectionInput | undefined,
  primary: 'title' | 'description'
): unknown {
  if (!section) return undefined;
  const alt = primary === 'title' ? section.heading : section.subtitle;
  const value = section[primary] ?? alt;
  if (value == null || value === '') return undefined;
  return value;
}

function hasTiptapContent(content: unknown): boolean {
  if (content == null || content === '') return false;
  if (typeof content === 'object') return Boolean(tiptapToText(content));
  return Boolean(String(content).trim());
}

function isProjectEntity(p: DisplayItem): p is Project {
  return typeof (p as Project)._id === 'string' && typeof (p as Project).slug === 'string';
}

function normalizeHref(href: string): string {
  const t = href.trim();
  if (t.startsWith('http') || t.startsWith('mailto:') || t.startsWith('tel:')) return t;
  return t.startsWith('/') ? t : `/${t}`;
}

function projectHref(p: DisplayItem): string {
  if (isProjectEntity(p)) return `/project-detail/${p.slug}`;
  const href = (p as ManualProject).href;
  return typeof href === 'string' && href.length > 0 ? normalizeHref(href) : '';
}

function projectTitleText(p: DisplayItem): string {
  if (isProjectEntity(p)) return tiptapToText(p.title) || p.title || '';
  return tiptapToText((p as ManualProject).title);
}

function projectDescriptionText(p: DisplayItem): string {
  if (isProjectEntity(p)) {
    return (
      tiptapToText(p.shortDescription) ||
      tiptapToText(p.description) ||
      ''
    );
  }
  return tiptapToText((p as ManualProject).description);
}

function projectImageUrl(p: DisplayItem): string {
  if (isProjectEntity(p)) return getImageSrc(p.featuredImage?.url || p.featuredImage);
  const img = (p as ManualProject).image;
  return img?.url ? getImageSrc(img.url) : '';
}

function projectYear(p: DisplayItem): string {
  if (!isProjectEntity(p)) return '';
  const raw = p.date || p.publishedAt;
  if (!raw) return '';
  try {
    return String(new Date(raw).getFullYear());
  } catch {
    return '';
  }
}

function mapProjectCard(item: DisplayItem, index: number): ProjectCard | null {
  const title = projectTitleText(item);
  const description = projectDescriptionText(item);
  const imageUrl = projectImageUrl(item);
  if (!title && !imageUrl) return null;

  const key = isProjectEntity(item) ? item._id : `manual-${index}`;

  return {
    key,
    title: title || 'Project',
    description,
    imageUrl,
    imageAlt: title || 'Project',
    year: projectYear(item),
    href: projectHref(item),
  };
}

export function ProjectsSection({
  projectSection,
  projectsSection,
  className,
  showViewAllLink = true,
  projectsLimit,
}: ProjectsSectionProps) {
  const { projects, pages } = useWebBuilder();

  const theme = useEditorialTheme();
  const primaryColor = theme.primary;
  const secondaryColor = theme.secondaryText;

  const sectionData = useMemo(() => {
    const projectDetailPage = pages.find((p) => p.pageType === 'project-detail');
    const metaSource =
      (projectSection as ProjectSectionInput | undefined) ??
      (projectDetailPage?.projectSection as ProjectSectionInput | undefined);
    const listingSource = projectsSection ?? projectDetailPage?.projectsSection;

    return {
      enabled:
        metaSource?.enabled ?? listingSource?.enabled ?? true,
      title:
        pickSectionField(metaSource, 'title') ??
        pickSectionField(listingSource as ProjectSectionInput | undefined, 'title'),
      description:
        pickSectionField(metaSource, 'description') ??
        pickSectionField(
          listingSource as ProjectSectionInput | undefined,
          'description'
        ),
      projectIds: listingSource?.projectIds,
      manualProjects: listingSource?.projects ?? [],
    };
  }, [projectSection, projectsSection, pages]);

  const resolvedTitle = useMemo(() => {
    const text = tiptapToText(sectionData.title);
    return text || 'Selected Projects';
  }, [sectionData.title]);

  const resolvedDescription = useMemo(
    () => tiptapToText(sectionData.description),
    [sectionData.description]
  );

  const hasTitle = hasTiptapContent(sectionData.title);
  const hasDescription = hasTiptapContent(sectionData.description);

  const cards = useMemo(() => {
    const manual = sectionData.manualProjects;
    const fromApi = (projects ?? []).filter((p) =>
      sectionData.projectIds?.length
        ? sectionData.projectIds.includes(p._id)
        : p.status === 'published'
    );

    const items = manual.length > 0 ? manual : fromApi;
    const limited =
      typeof projectsLimit === 'number' && projectsLimit > 0
        ? items.slice(0, projectsLimit)
        : items;

    return limited
      .map((item, index) => mapProjectCard(item, index))
      .filter((card): card is ProjectCard => card !== null);
  }, [sectionData, projects, projectsLimit]);

  const projectsHref = useMemo(() => {
    const projectPage = pages.find((p) => p.pageType === 'project-detail');
    return projectPage ? getPageHref(projectPage) : '/project-detail';
  }, [pages]);

  const borderTint = themeSurface(primaryColor, 0.2);

  const { ref: triggerRef, isVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.12,
  });
  const loaded = isVisible;

  if (!sectionData.enabled) return null;
  if (!cards.length && !hasTitle && !hasDescription) return null;

  return (
    <section id="projects" className={cn(SECTION.wrap, className)}>
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
              Featured Work
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
            <SectionRail index="07" loaded={loaded} primaryColor={primaryColor} />
          </div>
        </div>

        {cards.length > 0 ? (
          <div className={`${SECTION.content} space-y-0`}>
            {cards.map((card, i) => {
              const isEven = i % 2 === 1;
              const rowDelay = 0.55 + i * 0.14;

              const inner = (
                <article
                  className={cn(
                    'group relative flex flex-col overflow-hidden border lg:min-h-[340px] lg:flex-row',
                    isEven && 'lg:flex-row-reverse'
                  )}
                  style={{
                    borderColor: borderTint,
                    opacity: loaded ? 1 : 0,
                    transform: loaded ? 'translateY(0)' : 'translateY(32px)',
                    clipPath: loaded
                      ? 'inset(0 0 0 0)'
                      : isEven
                        ? 'inset(0 0 0 100%)'
                        : 'inset(0 100% 0 0)',
                    transition: `clip-path ${ENTRANCE} ${EASE}, opacity 0.85s ${EASE}, transform 0.85s ${EASE}`,
                    transitionDelay: `${rowDelay}s`,
                  }}
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden lg:aspect-auto lg:w-[52%] lg:min-h-[340px]">
                    {card.imageUrl ? (
                      <OptimizedImage
                        src={card.imageUrl}
                        alt={card.imageAlt}
                        fill
                        className="object-cover transition-transform duration-[1.1s] ease-out group-hover:scale-[1.05]"
                        sizes={IMAGE_SIZES.sectionHalf}
                      />
                    ) : (
                      <div
                        className="h-full min-h-[220px] w-full"
                        style={{
                          background: `linear-gradient(145deg, ${themeSurface(primaryColor, 0.2)} 0%, ${themeSurface(secondaryColor, 0.35)} 100%)`,
                        }}
                      />
                    )}
                    {card.year && (
                      <span
                        className="absolute left-5 top-5 border bg-[var(--wb-page-bg)] px-3 py-1.5 text-[10px] uppercase tracking-[0.22em]"
                        style={{
                          fontFamily: 'var(--wb-body-font, sans-serif)',
                          borderColor: borderTint,
                          color: primaryColor,
                        }}
                      >
                        {card.year}
                      </span>
                    )}
                  </div>

                  <div
                    className="relative flex flex-1 flex-col justify-center p-6 md:p-10 lg:p-12"
                    style={{ backgroundColor: themeSurface(primaryColor, 0.03) }}
                  >
                    <span
                      className="pointer-events-none absolute -right-2 bottom-2 select-none text-[4.5rem] font-normal leading-none sm:text-[7rem] md:text-[8rem]"
                      style={{
                        fontFamily: 'var(--wb-heading-font, Georgia, serif)',
                        color: themeSurface(primaryColor, 0.07),
                      }}
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <p
                      className="text-[10px] font-medium uppercase tracking-[0.28em]"
                      style={{
                        fontFamily: 'var(--wb-body-font, sans-serif)',
                        color: primaryColor,
                      }}
                    >
                      Project {String(i + 1).padStart(2, '0')}
                    </p>

                    <h4
                      className="relative z-10 mt-3 text-2xl text-[var(--wb-text-main)] md:text-3xl lg:text-[2rem]"
                      style={{ fontFamily: 'var(--wb-heading-font, Georgia, serif)' }}
                    >
                      {card.title}
                    </h4>

                    {card.description && (
                      <p
                        className="relative z-10 mt-4 max-w-lg text-sm leading-relaxed text-[var(--wb-text-secondary)] md:text-[0.9375rem]"
                        style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
                      >
                        {card.description.length > 180
                          ? `${card.description.slice(0, 180)}...`
                          : card.description}
                      </p>
                    )}

                    <span
                      className="relative z-10 mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] transition-transform duration-300 group-hover:translate-x-1"
                      style={{
                        fontFamily: 'var(--wb-body-font, sans-serif)',
                        color: primaryColor,
                      }}
                    >
                      View project
                      <span aria-hidden="true">→</span>
                    </span>

                    <div
                      className="absolute bottom-0 left-0 h-[3px] w-0 transition-all duration-700 group-hover:w-full"
                      style={{ backgroundColor: primaryColor }}
                    />
                  </div>
                </article>
              );

              return (
                <div key={card.key} className={i > 0 ? 'mt-6 md:mt-8' : undefined}>
                  {card.href ? (
                    <Link href={card.href} className="block">
                      {inner}
                    </Link>
                  ) : (
                    inner
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p
            className={`${SECTION.content} text-center text-sm ${SECTION.body}`}
            style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
          >
            No published projects yet. Add projects in the builder to show them here.
          </p>
        )}

        {showViewAllLink && cards.length > 0 && (
          <div className="mt-8 flex justify-end">
            <Link
              href={projectsHref}
              className="group inline-flex items-center gap-2 text-sm transition-transform duration-300 hover:-translate-y-0.5"
              style={{
                fontFamily: 'var(--wb-body-font, sans-serif)',
                color: primaryColor,
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.6s ${EASE}, transform 0.6s ${EASE}`,
                transitionDelay: `${1 + cards.length * 0.12}s`,
              }}
            >
              View All Projects
              <span
                className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProjectsSection;
