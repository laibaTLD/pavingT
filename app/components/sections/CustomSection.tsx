'use client';

import React from 'react';
import { Page } from '@/app/lib/types';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { getImageSrc, cn } from '@/app/lib/utils';
import { OptimizedImage, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';

interface CustomSectionProps {
    section: NonNullable<Page['customSections']>[number];
    className?: string;
}

export const CustomSection: React.FC<CustomSectionProps> = ({ section, className }) => {
    const themeColors = useThemeColors();
    const themeFonts = useThemeFonts();

    return (
        <section className={cn('py-10 sm:py-14 md:py-16', className)} style={{ backgroundColor: themeColors.pageBackground }}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {section.title && (
                    <h2
                        className="mb-6 text-2xl font-bold break-words sm:mb-8 sm:text-3xl md:text-4xl"
                        style={{ color: themeColors.mainText, fontFamily: themeFonts.heading }}
                    >
                        <TiptapRenderer content={section.title} />
                    </h2>
                )}

                {section.type === 'text' && section.content && (
                    <div className="prose prose-base max-w-none sm:prose-lg overflow-x-auto" style={{ color: themeColors.secondaryText, fontFamily: themeFonts.body }}>
                        <TiptapRenderer content={section.content} />
                    </div>
                )}

                {section.type === 'image' && section.images && (
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {section.images.map((image, index) => {
                            const imageUrl = typeof image === 'string' ? image : (image as any).url || (image as any).fileName || (image as any).filePath;
                            return (
                                <OptimizedImage
                                    key={index}
                                    src={getImageSrc(imageUrl)}
                                    alt={(image as any).altText || ''}
                                    width={900}
                                    height={600}
                                    sizes={IMAGE_SIZES.gridThird}
                                    className="h-auto w-full max-w-full rounded-lg shadow-lg"
                                />
                            );
                        })}
                    </div>
                )}

                {section.type === 'video' && section.content && (
                    <div className="relative mx-auto aspect-video w-full max-w-4xl overflow-hidden rounded-lg shadow-lg">
                        <video
                            src={getImageSrc(section.content)}
                            className="h-full w-full object-cover"
                            controls
                        />
                    </div>
                )}

                {section.type === 'html' && section.content && (
                    <div className="max-w-full overflow-x-auto break-words" dangerouslySetInnerHTML={{ __html: section.content }} />
                )}
            </div>
        </section>
    );
};
