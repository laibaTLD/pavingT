'use client';

import React from 'react';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { useThemeColors } from '@/app/hooks/useTheme';
import { getImageSrc } from '@/app/lib/utils';

interface ServiceBannerProps {
    service: any;
}

// Utility function to get full image URL
const getFullImageUrl = (url?: string): string | undefined => {
    if (!url) return undefined;
    const resolved = getImageSrc(url);
    return resolved || undefined;
};

export const ServiceBanner: React.FC<ServiceBannerProps> = ({ service }) => {
    const themeColors = useThemeColors();

    // Determine banner title
    const bannerTitle = service.banner?.useServiceNameAsTitle !== false
        ? service.name
        : service.banner?.customTitle || service.name;

    // Banner background image
    const bannerBgImage = service.banner?.backgroundImage?.url
        ? getFullImageUrl(service.banner.backgroundImage.url)
        : service.thumbnailImage?.url
            ? getFullImageUrl(service.thumbnailImage.url)
            : undefined;

    // Banner overlay opacity
    const overlayOpacity = service.banner?.overlayOpacity ?? 50;

    return (
        <section
            className="relative w-full min-h-[60vh] md:min-h-[70vh] lg:min-h-[80vh] flex items-center justify-center overflow-hidden"
            style={{
                backgroundImage: bannerBgImage ? `url(${bannerBgImage})` : undefined,
        backgroundColor: themeColors.pageBackground,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Gradient Overlay - always show for consistent look */}
            <div
                className="absolute inset-0"
                style={{
                    background: bannerBgImage 
                        ? `linear-gradient(to bottom, color-mix(in srgb, ${themeColors.pageBackground} ${overlayOpacity}%, transparent) 0%, color-mix(in srgb, ${themeColors.pageBackground} ${overlayOpacity * 0.6}%, transparent) 100%)`
                        : `linear-gradient(to bottom, color-mix(in srgb, ${themeColors.pageBackground} 70%, transparent) 0%, color-mix(in srgb, ${themeColors.pageBackground} 50%, transparent) 100%)`,
                }}
            />

            {/* Architectural Grid Lines */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="absolute left-1/4 top-0 bottom-0 w-px bg-[color-mix(in_srgb,var(--wb-text-main)_30%,transparent)]" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[color-mix(in_srgb,var(--wb-text-main)_30%,transparent)]" />
                <div className="absolute left-3/4 top-0 bottom-0 w-px bg-[color-mix(in_srgb,var(--wb-text-main)_30%,transparent)]" />
            </div>

            {/* Banner Content */}
            <div className="relative z-10 mx-auto max-w-5xl px-5 py-16 text-center sm:px-6 md:px-12 md:py-32">
                {/* Label */}
                <div className="mb-6 flex items-center justify-center gap-3 sm:mb-8 sm:gap-4">
                    <div className="h-[1px] w-8 bg-[color-mix(in_srgb,var(--wb-text-main)_40%,transparent)] sm:w-12" />
                    <span 
                        className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--wb-text-secondary)] md:text-xs"
                        style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
                    >
                        Our Services
                    </span>
                    <div className="h-[1px] w-8 bg-[color-mix(in_srgb,var(--wb-text-main)_40%,transparent)] sm:w-12" />
                </div>

                <h1
                    className="mb-6 break-words text-3xl font-normal uppercase leading-[0.95] tracking-tight text-[var(--wb-text-main)] sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl"
                    style={{ fontFamily: 'var(--wb-heading-font, Georgia, serif)' }}
                >
                    {bannerTitle}
                </h1>
                
                {service.shortDescription && (
                    <div
                        className="mx-auto max-w-2xl text-sm leading-relaxed tracking-wide text-[var(--wb-text-secondary)] break-words md:text-lg lg:text-xl"
                        style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
                    >
                        {typeof service.shortDescription === 'string'
                            ? service.shortDescription
                            : <TiptapRenderer content={service.shortDescription} as="inline" />}
                    </div>
                )}
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 opacity-60 sm:flex">
                <span
                    className="text-[9px] uppercase tracking-[0.3em] text-[var(--wb-text-secondary)]"
                    style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
                >
                    Scroll
                </span>
                <div className="h-8 w-px bg-gradient-to-b from-[color-mix(in_srgb,var(--wb-text-main)_60%,transparent)] to-transparent" />
            </div>
        </section>
    );
};
