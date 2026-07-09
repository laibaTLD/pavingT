import { siteApi, pageApi } from '@/app/lib/api';
import type { Page, Site } from '@/app/lib/types';

export type InitialSiteData = {
  site: Site;
  pages: Page[];
};

/** Server-side fetch for instant first paint (site + pages only). */
export async function fetchInitialSiteData(): Promise<InitialSiteData | null> {
  const siteSlug = process.env.NEXT_PUBLIC_WEBBUILDER_SITE_SLUG;
  if (!siteSlug) return null;

  try {
    const site = await siteApi.getSiteBySlug(siteSlug, { silent: true });
    const pages = await pageApi.getPagesBySite(site.slug, { silent: true });
    return { site, pages };
  } catch {
    return null;
  }
}
