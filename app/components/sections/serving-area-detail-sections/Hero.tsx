'use client';

import React from 'react';
import type { Page } from '@/app/lib/types';
import { HeroSection as CinematicHeroSection } from '@/app/components/sections/HeroSection';

interface HeroSectionProps {
  hero?: unknown;
  className?: string;
}

/** Service area hero — same layout as the site home hero, without zoom that softens photos. */
export const HeroSection: React.FC<HeroSectionProps> = ({ hero, className }) => {
  if (!hero || typeof hero !== 'object') return null;

  const heroData = hero as Page['hero'];
  if (heroData?.enabled === false) return null;

  return (
    <CinematicHeroSection
      hero={heroData}
      className={className}
      preserveImageQuality
    />
  );
};

export default HeroSection;
