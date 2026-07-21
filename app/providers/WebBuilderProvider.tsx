'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Site, Page, Service, BlogPost, Project } from '@/app/lib/types';
import { siteApi, pageApi, serviceApi, blogApi, projectApi, testimonialApi, serviceAreaApi } from '@/app/lib/api';
import type { InitialSiteData } from '@/app/lib/serverSiteData';

// Site slug from environment variable
const SITE_SLUG = process.env.NEXT_PUBLIC_WEBBUILDER_SITE_SLUG;

/** Parsed poll interval in ms; 0 disables polling. Defaults avoid API rate limits in production. */
function readPollIntervalMs(envKey: string, defaultMs: number): number {
  const raw = process.env[envKey];
  if (raw === undefined || raw === '') return defaultMs;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : defaultMs;
}

const isProdBuild = process.env.NODE_ENV === 'production';

/** Site/theme refresh (formerly every 3s — far too aggressive for deployed APIs). */
const SITE_POLL_INTERVAL_MS = readPollIntervalMs(
  'NEXT_PUBLIC_WEBBUILDER_SITE_POLL_INTERVAL_MS',
  isProdBuild ? 0 : 15_000
);

/** Pages, projects, services refresh (formerly every 5s each). */
const CONTENT_POLL_INTERVAL_MS = readPollIntervalMs(
  'NEXT_PUBLIC_WEBBUILDER_CONTENT_POLL_INTERVAL_MS',
  isProdBuild ? 0 : 60_000
);





interface WebBuilderContextType {
  site: Site | null;
  pages: Page[];
  services: Service[];
  blogPosts: BlogPost[];
  projects: Project[];
  testimonials: { title?: string; description?: string; testimonials: any[] } | null;
  serviceAreaPages: any[];
  currentPage: Page | null;
  setCurrentPage: (page: Page | null) => void;
  loading: boolean;
  error: string | null;
  loadPage: (siteSlug: string, pageSlug: string) => Promise<void>;
}

const WebBuilderContext = createContext<WebBuilderContextType | undefined>(undefined);

export const useWebBuilder = () => {
  const context = useContext(WebBuilderContext);
  if (context === undefined) {
    throw new Error('useWebBuilder must be used within a WebBuilderProvider');
  }
  return context;
};

interface WebBuilderProviderProps {
  children: ReactNode;
  initialData?: InitialSiteData | null;
}

export const WebBuilderProvider: React.FC<WebBuilderProviderProps> = ({
  children,
  initialData = null,
}) => {
  const [site, setSite] = useState<Site | null>(initialData?.site ?? null);
  const [pages, setPages] = useState<Page[]>(initialData?.pages ?? []);
  const [services, setServices] = useState<Service[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [testimonials, setTestimonials] = useState<{ title?: string; description?: string; testimonials: any[] } | null>(null);
  const [serviceAreaPages, setServiceAreaPages] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  const loadSecondaryContent = async (siteSlug: string) => {
    await Promise.all([
      loadServicesBySiteSlug(siteSlug),
      loadBlogPosts(siteSlug),
      loadProjects(siteSlug),
      loadTestimonials(siteSlug),
      loadServiceAreaPages(siteSlug),
    ]);
  };

  const loadSite = async (slug: string) => {
    try {
      setLoading(true);
      setError(null);

      const siteData = await siteApi.getSiteBySlug(slug);
      setSite(siteData);
      await loadPages(siteData.slug);
      setLoading(false);

      void loadSecondaryContent(siteData.slug);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load site';
      setError(
        msg.includes('500')
          ? 'The site builder API is temporarily unavailable. Refresh the page or try again shortly.'
          : msg
      );
      setLoading(false);
    }
  };

  const loadPage = async (siteSlug: string, pageSlug: string) => {
    try {
      setLoading(true);
      setError(null);
      const pageData = await pageApi.getPageBySlug(siteSlug, pageSlug);
      setCurrentPage(pageData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  const loadPages = async (siteSlug: string) => {
    try {
      const pagesData = await pageApi.getPagesBySite(siteSlug);
      setPages(pagesData);
    } catch (err) {
      console.warn('Failed to load pages:', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const loadServicesBySiteSlug = async (siteSlug: string) => {
    try {
      const servicesData = await serviceApi.getServicesBySite(siteSlug, { silent: true });
      if (!Array.isArray(servicesData)) return;
      setServices(servicesData);
    } catch {
      /* secondary content — soft-fail; keep previous */
    }
  };

  const loadBlogPosts = async (siteSlug: string, limit?: number) => {
    try {
      const postsData = await blogApi.getPostsBySite(siteSlug, limit, { silent: true });
      if (!Array.isArray(postsData)) return;
      setBlogPosts(postsData);
    } catch {
      /* secondary content — soft-fail; keep previous */
    }
  };

  const loadProjects = async (siteSlug: string, limit?: number) => {
    try {
      const projectsData = await projectApi.getProjectsBySite(siteSlug, limit, { silent: true });
      if (!Array.isArray(projectsData)) return;
      setProjects(projectsData);
    } catch {
      /* secondary content — soft-fail; keep previous */
    }
  };

  const loadTestimonials = async (siteSlug: string) => {
    try {
      const testimonialsData = await testimonialApi.getTestimonialsBySite(siteSlug, { silent: true });
      setTestimonials(testimonialsData);
    } catch {
      /* secondary content — soft-fail; keep previous */
    }
  };

  const loadServiceAreaPages = async (siteSlug: string) => {
    try {
      const serviceAreaPagesData = await serviceAreaApi.getServiceAreaPagesBySite(siteSlug, {
        silent: true,
      });
      if (!Array.isArray(serviceAreaPagesData)) return;
      setServiceAreaPages(serviceAreaPagesData);
    } catch {
      /* secondary content — soft-fail; keep previous (do not wipe with []) */
    }
  };

  const initialSlug = initialData?.site?.slug;

  useEffect(() => {
    if (!SITE_SLUG) {
      setError('NEXT_PUBLIC_WEBBUILDER_SITE_SLUG environment variable is not defined. Please check your .env file.');
      setLoading(false);
      return;
    }

    if (initialSlug) {
      setLoading(false);
      void loadSecondaryContent(initialSlug);
      return;
    }

    loadSite(SITE_SLUG);
  }, [initialSlug]);

  // Poll site for builder edits (theme, service areas, business info, etc.)
  useEffect(() => {
    if (!site?.slug || SITE_POLL_INTERVAL_MS <= 0) return;

    const siteFingerprint = (s: Site) =>
      JSON.stringify({
        theme: s.theme,
        serviceAreas: s.serviceAreas,
        business: s.business,
        footer: s.footer,
        socialLinks: s.socialLinks,
      });

    const intervalId = setInterval(async () => {
      try {
        const siteData = await siteApi.getSiteBySlug(site.slug, { silent: true });
        setSite((prevSite) => {
          if (!prevSite) return siteData;
          return siteFingerprint(prevSite) !== siteFingerprint(siteData) ? siteData : prevSite;
        });
      } catch {
        /* ignore polling errors */
      }
    }, SITE_POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [site?.slug]);

  useEffect(() => {
    if (!site?.slug || CONTENT_POLL_INTERVAL_MS <= 0) return;

    const intervalId = setInterval(async () => {
      try {
        const projectsData = await projectApi.getProjectsBySite(site.slug, undefined, { silent: true });
        setProjects((prevProjects) =>
          JSON.stringify(prevProjects) !== JSON.stringify(projectsData)
            ? projectsData
            : prevProjects
        );
      } catch {
        /* ignore */
      }
    }, CONTENT_POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [site?.slug]);

  useEffect(() => {
    if (!site?.slug || CONTENT_POLL_INTERVAL_MS <= 0) return;

    const intervalId = setInterval(async () => {
      try {
        const pagesData = await pageApi.getPagesBySite(site.slug, { silent: true });
        setPages((prevPages) =>
          JSON.stringify(prevPages) !== JSON.stringify(pagesData) ? pagesData : prevPages
        );
      } catch {
        /* ignore */
      }
    }, CONTENT_POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [site?.slug]);

  useEffect(() => {
    if (!site?.slug || CONTENT_POLL_INTERVAL_MS <= 0) return;

    const intervalId = setInterval(async () => {
      try {
        const servicesData = await serviceApi.getServicesBySite(site.slug, { silent: true });
        if (!Array.isArray(servicesData)) return;
        setServices((prevServices) =>
          JSON.stringify(prevServices) !== JSON.stringify(servicesData)
            ? servicesData
            : prevServices
        );
      } catch {
        /* ignore */
      }
    }, CONTENT_POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [site?.slug]);

  useEffect(() => {
    if (!site?.slug || CONTENT_POLL_INTERVAL_MS <= 0) return;

    const intervalId = setInterval(async () => {
      try {
        const data = await serviceAreaApi.getServiceAreaPagesBySite(site.slug, { silent: true });
        if (!Array.isArray(data)) return;
        setServiceAreaPages((prev) =>
          JSON.stringify(prev) !== JSON.stringify(data) ? data : prev
        );
      } catch {
        /* ignore */
      }
    }, CONTENT_POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [site?.slug]);

  const contextValue: WebBuilderContextType = {
    site,
    pages,
    services,
    blogPosts,
    projects,
    testimonials,
    serviceAreaPages,
    currentPage,
    setCurrentPage,
    loading,
    error,
    loadPage,
  };

  return (
    <WebBuilderContext.Provider value={contextValue}>
      {children}
    </WebBuilderContext.Provider>
  );
};
