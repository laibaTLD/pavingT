'use client';

import Link from 'next/link';
import { OptimizedImage, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import {
  getBrandName,
  getPageHref,
  getTestimonialsNavItem,
} from '@/app/lib/siteContent';
import { buildServiceAreas } from '@/app/components/sections/ServingAreasSection';
import { resolveServiceSlug, getServiceAreaPageHref } from '@/app/lib/serviceAreaSlugs';
import { getImageSrc } from '@/app/lib/utils';
import { themeSurface } from '@/lib/theme';
import { useEditorialTheme, WB } from '@/hooks/useEditorialTheme';

interface HeaderProps {
  businessName?: string;
  themeData?: { primaryColor: string; secondaryColor: string };
  phoneNumber?: string;
}

export function Header({ businessName, themeData, phoneNumber }: HeaderProps) {
  const { site, pages, services: allServices, serviceAreaPages } = useWebBuilder();
  const theme = useEditorialTheme();

  const resolvedBusinessName = businessName || getBrandName(site) || 'Business';
  const primaryColor = themeData?.primaryColor || theme.primary;

  const logoSrc = useMemo(() => {
    const url = site?.theme?.logoUrl || site?.footer?.logo?.url;
    return url ? getImageSrc(url) : '';
  }, [site?.theme?.logoUrl, site?.footer?.logo?.url]);

  const resolvedPhone = phoneNumber || site?.business?.phone;

  const logoAlt =
    site?.footer?.logo?.altText?.trim() || `${resolvedBusinessName} logo`;

  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileServingAreasOpen, setMobileServingAreasOpen] = useState(false);
  const [activeServicePanel, setActiveServicePanel] = useState<string | 'all-areas' | null>(null);

  const closeServicesTimeoutRef = useRef<number | null>(null);
  const openServices = () => {
    if (closeServicesTimeoutRef.current) clearTimeout(closeServicesTimeoutRef.current);
    closeServicesTimeoutRef.current = null;
    setServicesOpen(true);
  };
  const scheduleCloseServices = () => {
    if (closeServicesTimeoutRef.current) clearTimeout(closeServicesTimeoutRef.current);
    closeServicesTimeoutRef.current = window.setTimeout(() => {
      setServicesOpen(false);
      setActiveServicePanel(null);
    }, 400);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 48);
      setIsVisible(currentScrollY <= lastScrollYRef.current || currentScrollY < 80);
      lastScrollYRef.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (closeServicesTimeoutRef.current) clearTimeout(closeServicesTimeoutRef.current);
    };
  }, []);

  const navItems = useMemo(() => {
    const aboutPage = pages.find((p) => p.pageType === 'about');
    const servicesPage = pages.find((p) => p.pageType === 'service-list');
    const contactPage = pages.find((p) => p.pageType === 'contact');
    const testimonialsNav = getTestimonialsNavItem(pages);
    const servicesHref = servicesPage ? getPageHref(servicesPage) : '/services';

    return [
      { href: '/', label: 'Home', isServices: false },
      {
        href: aboutPage ? getPageHref(aboutPage) : '/about-us',
        label: aboutPage?.name?.trim() || 'About',
        isServices: false,
      },
      {
        href: servicesHref,
        label: servicesPage?.name?.trim() || 'Services',
        isServices: true,
      },
      {
        href: '/gallery',
        label: 'Gallery',
        isServices: false,
      },
      {
        href: testimonialsNav.href,
        label: testimonialsNav.name,
        isServices: false,
      },
      {
        href: contactPage ? getPageHref(contactPage) : '/contact-us',
        label: contactPage?.name?.trim() || 'Contact',
        isServices: false,
      },
    ];
  }, [pages]);

  const services = useMemo(
    () =>
      allServices
        .filter((service) => service.status === 'published')
        .map((service) => {
          const slug = resolveServiceSlug(service);
          return {
            label: service.name,
            slug,
            href: `/service/${slug}`,
          };
        }),
    [allServices]
  );

  const servingAreasNav = useMemo(() => {
    const areas = buildServiceAreas(
      undefined,
      allServices,
      serviceAreaPages,
      site?.serviceAreas
    );

    return areas.map((area) => ({
      label: area.region ? `${area.city}, ${area.region}` : area.city,
      href: area.href || getServiceAreaPageHref(area.serviceSlug, area, serviceAreaPages),
      serviceSlug: area.serviceSlug,
    }));
  }, [allServices, serviceAreaPages, site?.serviceAreas]);

  const servingAreasByService = useMemo(() => {
    const map = new Map<string, { label: string; href: string }[]>();
    servingAreasNav.forEach((area) => {
      const list = map.get(area.serviceSlug) ?? [];
      list.push({ label: area.label, href: area.href });
      map.set(area.serviceSlug, list);
    });
    return map;
  }, [servingAreasNav]);

  const nestedPanelItems = useMemo(() => {
    if (!activeServicePanel) return [];
    if (activeServicePanel === 'all-areas') {
      return servingAreasNav.map(({ label, href }) => ({ label, href }));
    }
    return servingAreasByService.get(activeServicePanel) ?? [];
  }, [activeServicePanel, servingAreasNav, servingAreasByService]);

  const hasServicesMenu = services.length > 0 || servingAreasNav.length > 0;

  useEffect(() => {
    if (!servicesOpen) return;
    setActiveServicePanel((current) => {
      if (current) return current;
      if (servingAreasNav.length > 0) return 'all-areas';
      const first = services.find((s) => (servingAreasByService.get(s.slug)?.length ?? 0) > 0);
      return first?.slug ?? null;
    });
  }, [servicesOpen, servingAreasNav, services, servingAreasByService]);

  const onHero = !isScrolled;
  const navBg = onHero
    ? 'bg-[color-mix(in_srgb,var(--wb-page-bg)_88%,transparent)] border-b border-transparent'
    : 'bg-[color-mix(in_srgb,var(--wb-page-bg)_95%,transparent)] backdrop-blur-md border-b';
  const navBorder = themeSurface(primaryColor, 0.14);

  const NavLink = ({
    href,
    label,
    children,
  }: {
    href: string;
    label: string;
    children?: React.ReactNode;
  }) => (
    <Link
      href={href}
      replace
      className="group relative inline-flex items-center gap-1 text-sm font-medium tracking-wide text-[var(--wb-text-main)] transition-colors hover:text-[var(--wb-primary)]"
      style={{ fontFamily: WB.bodyFont }}
    >
      <span>{label}</span>
      {children}
      <span
        className="absolute -bottom-1 left-0 h-px w-0 transition-all duration-300 group-hover:w-full"
        style={{ backgroundColor: primaryColor }}
      />
    </Link>
  );

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${navBg} ${
          !isVisible ? '-translate-y-full' : 'translate-y-0'
        }`}
        style={{ borderColor: navBorder, ['--wb-header-height' as string]: '3.25rem' }}
      >
        <div className="mx-auto flex h-[var(--wb-header-height)] max-w-7xl items-center justify-between gap-4 px-6 sm:px-8 lg:px-12">
          <div className="shrink-0">
            <Link
              href="/"
              replace
              className="inline-flex items-center"
              aria-label={resolvedBusinessName}
            >
              {logoSrc ? (
                <OptimizedImage
                  alt={logoAlt}
                  src={logoSrc}
                  width={160}
                  height={56}
                  sizes={IMAGE_SIZES.logo}
                  className="h-9 w-auto object-contain transition-all duration-300 md:h-10"
                  priority
                />
              ) : (
                <span
                  className="text-base font-medium tracking-tight text-[var(--wb-text-main)] md:text-lg"
                  style={{ fontFamily: WB.headingFont }}
                >
                  {resolvedBusinessName}
                </span>
              )}
            </Link>
          </div>

          <div className="hidden lg:flex flex-1 items-center justify-center gap-8">
            {navItems.map((item) => {
              if (item.isServices) {
                return (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={openServices}
                    onMouseLeave={scheduleCloseServices}
                  >
                    <NavLink href={item.href} label={item.label}>
                      <svg
                        className={`w-3 h-3 transition-transform ${servicesOpen ? 'rotate-180' : ''}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </NavLink>
                    {servicesOpen && hasServicesMenu && (
                      <div
                        className="absolute top-full left-1/2 mt-3 flex -translate-x-1/2 overflow-hidden border bg-[var(--wb-page-bg)] shadow-[0_16px_40px_color-mix(in_srgb,var(--wb-text-main)_10%,transparent)]"
                        style={{ borderColor: themeSurface(primaryColor, 0.18) }}
                        onMouseEnter={openServices}
                      >
                        <div className="w-64 shrink-0 border-r py-2" style={{ borderColor: themeSurface(primaryColor, 0.12) }}>
                          <ul>
                            {services.map((svc) => {
                              const hasAreas = (servingAreasByService.get(svc.slug)?.length ?? 0) > 0;
                              const isActive = activeServicePanel === svc.slug;
                              return (
                                <li key={svc.href}>
                                  <div
                                    className={`flex items-center justify-between gap-2 px-4 py-2.5 transition-colors ${
                                      isActive
                                        ? 'bg-[color-mix(in_srgb,var(--wb-primary)_8%,transparent)]'
                                        : 'hover:bg-[color-mix(in_srgb,var(--wb-primary)_6%,transparent)]'
                                    }`}
                                    onMouseEnter={() => {
                                      if (hasAreas) setActiveServicePanel(svc.slug);
                                    }}
                                  >
                                    <Link
                                      href={svc.href}
                                      replace
                                      className={`flex-1 text-sm transition-colors ${
                                        isActive
                                          ? 'font-medium text-[var(--wb-text-main)]'
                                          : 'text-[var(--wb-text-secondary)] hover:text-[var(--wb-text-main)]'
                                      }`}
                                      style={{ fontFamily: WB.bodyFont }}
                                    >
                                      {svc.label}
                                    </Link>
                                    {hasAreas && (
                                      <span
                                        className="shrink-0 text-xs text-[var(--wb-text-secondary)]"
                                        aria-hidden="true"
                                      >
                                        ›
                                      </span>
                                    )}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                          {servingAreasNav.length > 0 && (
                            <div
                              className="mt-1 border-t pt-1"
                              style={{ borderColor: themeSurface(primaryColor, 0.12) }}
                            >
                              <div
                                className={`flex items-center justify-between gap-2 px-4 py-2.5 transition-colors ${
                                  activeServicePanel === 'all-areas'
                                    ? 'bg-[color-mix(in_srgb,var(--wb-primary)_8%,transparent)]'
                                    : 'hover:bg-[color-mix(in_srgb,var(--wb-primary)_6%,transparent)]'
                                }`}
                                onMouseEnter={() => setActiveServicePanel('all-areas')}
                              >
                                <span
                                  className={`flex-1 text-sm uppercase tracking-[0.12em] ${
                                    activeServicePanel === 'all-areas'
                                      ? 'font-medium text-[var(--wb-text-main)]'
                                      : 'text-[var(--wb-text-secondary)]'
                                  }`}
                                  style={{ fontFamily: WB.bodyFont }}
                                >
                                  Serving Areas
                                </span>
                                <span
                                  className="shrink-0 text-xs text-[var(--wb-text-secondary)]"
                                  aria-hidden="true"
                                >
                                  ›
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {nestedPanelItems.length > 0 && (
                          <div className="max-h-80 w-56 shrink-0 overflow-y-auto py-2">
                            <ul>
                              {nestedPanelItems.map((area) => (
                                <li key={area.href}>
                                  <Link
                                    href={area.href}
                                    replace
                                    className="block px-4 py-2.5 text-sm text-[var(--wb-text-secondary)] transition-colors hover:bg-[color-mix(in_srgb,var(--wb-primary)_6%,transparent)] hover:text-[var(--wb-text-main)]"
                                    style={{ fontFamily: WB.bodyFont }}
                                  >
                                    {area.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              }
              return <NavLink key={item.href} href={item.href} label={item.label} />;
            })}
          </div>

          <div className="hidden lg:flex items-center">
            <Link
              href={resolvedPhone ? `tel:${resolvedPhone}` : '#'}
              className="inline-flex items-center gap-2 bg-[var(--wb-card-bg-light)] px-5 py-2 text-xs font-medium tracking-wide text-[var(--wb-text-main)] shadow-[0_4px_16px_color-mix(in_srgb,var(--wb-text-main)_10%,transparent)] transition-shadow duration-300 hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--wb-primary)_22%,transparent)]"
              style={{ fontFamily: WB.bodyFont }}
            >
              Call Us
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="border p-2 text-[var(--wb-text-main)] transition-colors hover:text-[var(--wb-primary)]"
              style={{ borderColor: themeSurface(primaryColor, 0.35) }}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? (
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <div className="flex h-4 w-6 flex-col justify-between">
                  <span className="block h-px w-full bg-current" />
                  <span className="block h-px w-full bg-current" />
                  <span className="block h-px w-3/4 self-end bg-current" />
                </div>
              )}
            </button>
          </div>
        </div>
      </nav>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex flex-col bg-[var(--wb-page-bg)]">
          <div
            className="flex items-center justify-between border-b px-6 py-4"
            style={{ borderColor: themeSurface(primaryColor, 0.12) }}
          >
            <Link href="/" replace onClick={() => setIsOpen(false)}>
              {logoSrc ? (
                <OptimizedImage
                  alt={logoAlt}
                  src={logoSrc}
                  width={160}
                  height={56}
                  sizes={IMAGE_SIZES.logo}
                  className="h-14 w-auto object-contain"
                />
              ) : (
                <span
                  className="text-lg font-medium text-[var(--wb-text-main)]"
                  style={{ fontFamily: WB.headingFont }}
                >
                  {resolvedBusinessName}
                </span>
              )}
            </Link>
            <button
              aria-label="Close menu"
              onClick={() => setIsOpen(false)}
              className="p-2 text-[var(--wb-text-main)] transition-colors hover:text-[var(--wb-primary)]"
            >
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto px-6 py-8">
            <nav
              className="flex flex-col divide-y"
              style={{ borderColor: themeSurface(primaryColor, 0.12) }}
            >
              {navItems.map((item) => {
                if (item.isServices) {
                  return (
                    <div key={item.label} className="py-4">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between text-left text-lg text-[var(--wb-text-main)] transition-colors hover:text-[var(--wb-primary)]"
                        style={{ fontFamily: WB.headingFont }}
                        onClick={() => setMobileServicesOpen((v) => !v)}
                      >
                        {item.label}
                        <span style={{ color: primaryColor }}>{mobileServicesOpen ? '−' : '+'}</span>
                      </button>
                      {mobileServicesOpen && hasServicesMenu && (
                        <div className="mt-3 space-y-2 pl-4">
                          {services.map((svc) => (
                            <Link
                              key={svc.href}
                              href={svc.href}
                              replace
                              onClick={() => setIsOpen(false)}
                              className="block text-sm text-[var(--wb-text-secondary)] transition-colors hover:text-[var(--wb-primary)]"
                              style={{ fontFamily: WB.bodyFont }}
                            >
                              {svc.label}
                            </Link>
                          ))}
                          {servingAreasNav.length > 0 && (
                            <div className="pt-2">
                              <button
                                type="button"
                                className="flex w-full items-center justify-between text-left text-sm uppercase tracking-[0.12em] text-[var(--wb-text-main)]"
                                style={{ fontFamily: WB.bodyFont }}
                                onClick={() => setMobileServingAreasOpen((v) => !v)}
                              >
                                Serving Areas
                                <span style={{ color: primaryColor }}>
                                  {mobileServingAreasOpen ? '−' : '+'}
                                </span>
                              </button>
                              {mobileServingAreasOpen && (
                                <div className="mt-2 space-y-2 pl-4">
                                  {servingAreasNav.map((area) => (
                                    <Link
                                      key={area.href}
                                      href={area.href}
                                      replace
                                      onClick={() => setIsOpen(false)}
                                      className="block text-sm text-[var(--wb-text-secondary)] transition-colors hover:text-[var(--wb-primary)]"
                                      style={{ fontFamily: WB.bodyFont }}
                                    >
                                      {area.label}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    replace
                    onClick={() => setIsOpen(false)}
                    className="py-4 text-lg text-[var(--wb-text-main)] transition-colors hover:text-[var(--wb-primary)]"
                    style={{ fontFamily: WB.headingFont }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto pt-10">
              <Link
                href={resolvedPhone ? `tel:${resolvedPhone}` : '#'}
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-3 bg-[var(--wb-card-bg-light)] px-7 py-3.5 text-sm font-medium tracking-wide text-[var(--wb-text-main)] shadow-[0_8px_24px_color-mix(in_srgb,var(--wb-text-main)_12%,transparent)] transition-shadow duration-300 hover:shadow-[0_12px_40px_color-mix(in_srgb,var(--wb-primary)_25%,transparent)]"
                style={{ fontFamily: WB.bodyFont }}
              >
                Call Us <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
