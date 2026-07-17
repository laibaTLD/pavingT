'use client';

import React, { useState } from 'react';
import { cn } from '@/app/lib/utils';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';
import { Plus, Minus } from 'lucide-react';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';

interface ServiceFAQSectionProps {
    service: any;
}

export const ServiceFAQSection: React.FC<ServiceFAQSectionProps> = ({ service }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const themeColors = useThemeColors();
    const themeFonts = useThemeFonts();

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const brandColor = themeColors.primaryButton;

    // Service FAQ items
    const serviceFaqs = service.faqs || [];
    const hasFaqs = serviceFaqs.length > 0;

    if (!hasFaqs) return null;

    return (
        <section
            className="py-14 sm:py-20 md:py-32 lg:py-48"
            style={{ backgroundColor: themeColors.pageBackground, fontFamily: themeFonts.body }}
        >
            <div className="container mx-auto px-5 sm:px-6 lg:px-12">
                <div className="grid items-start gap-10 sm:gap-14 lg:grid-cols-12 lg:gap-24">

                    {/* Left Column: Architectural Section Header */}
                    <div className="space-y-6 sm:space-y-10 lg:col-span-4 lg:sticky lg:top-36">
                        <div className="space-y-4 sm:space-y-6">
                            <span
                                className="text-[10px] tracking-[0.4em] uppercase font-bold opacity-30"
                                style={{ color: themeColors.mainText }}
                            >
                                Frequently Asked Questions
                            </span>

                            <h2
                                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extralight tracking-[0.1em] uppercase leading-[1.1] text-balance break-words"
                                style={{
                                    color: themeColors.mainText,
                                    fontFamily: themeFonts.heading
                                }}
                            >
                                Common Questions
                            </h2>
                        </div>

                        <div
                            className="max-w-xs text-xs md:text-sm font-light leading-relaxed tracking-wider opacity-60 uppercase"
                            style={{ color: themeColors.secondaryText }}
                        >
                            Get answers to common questions about our {service.name} service.
                        </div>

                        {/* Signature Brand Detail */}
                        <div className="pt-4 sm:pt-8">
                            <div className="w-16 h-[2px]" style={{ backgroundColor: brandColor }} />
                        </div>
                    </div>

                    {/* Right Column: Premium Minimalist Accordion */}
                    <div className="min-w-0 lg:col-span-8">
                        <div>
                            {serviceFaqs.map((faq: any, index: number) => {
                                const isOpen = openIndex === index;
                                return (
                                    <div
                                        key={index}
                                        className="overflow-hidden transition-all duration-700"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => toggle(index)}
                                            className="group flex w-full items-start justify-between gap-3 py-6 text-left transition-all duration-300 sm:items-center sm:py-8 lg:py-14"
                                        >
                                            <div className="flex min-w-0 flex-1 items-start gap-4 sm:gap-8 md:gap-12 lg:gap-16">
                                                <span
                                                    className={cn(
                                                        "mt-1.5 shrink-0 text-[10px] font-bold tracking-[0.2em] transition-all duration-500 sm:mt-2.5",
                                                        isOpen ? "opacity-100" : "opacity-20"
                                                    )}
                                                    style={{ color: isOpen ? brandColor : themeColors.mainText }}
                                                >
                                                    {(index + 1).toString().padStart(2, '0')}
                                                </span>
                                                <h3
                                                    className={cn(
                                                        "min-w-0 text-lg font-extralight uppercase tracking-[0.05em] transition-all duration-500 sm:text-xl md:text-2xl lg:text-4xl break-words",
                                                        isOpen ? "italic scale-[1.01]" : "group-hover:opacity-50"
                                                    )}
                                                    style={{
                                                        color: themeColors.mainText,
                                                        fontFamily: themeFonts.heading
                                                    }}
                                                >
                                                    {typeof faq.question === 'string' 
                                                        ? faq.question 
                                                        : <TiptapRenderer content={faq.question} as="inline" />
                                                    }
                                                </h3>
                                            </div>

                                            <div
                                                className={cn(
                                                    "ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-500 sm:ml-4 sm:h-10 sm:w-10 md:h-12 md:w-12",
                                                    isOpen ? "rotate-180 border-transparent shadow-lg text-[var(--wb-text-on-dark)]" : "border-[color-mix(in_srgb,var(--wb-text-main)_10%,transparent)] group-hover:border-[color-mix(in_srgb,var(--wb-text-main)_30%,transparent)]"
                                                )}
                                                style={{
                                                    color: isOpen ? themeColors.darkPrimaryText : themeColors.mainText,
                                                    backgroundColor: isOpen ? brandColor : 'transparent',
                                                    borderColor: isOpen ? brandColor : undefined
                                                }}
                                            >
                                                {isOpen ? <Minus strokeWidth={1} size={18} /> : <Plus strokeWidth={1} size={18} />}
                                            </div>
                                        </button>

                                        <div
                                            className={cn(
                                                "grid transition-all duration-700 ease-[cubic-bezier(0.85,0,0.15,1)]",
                                                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                            )}
                                        >
                                            <div className="overflow-hidden">
                                                <div
                                                    className="max-w-2xl pb-8 pl-8 text-sm font-light leading-relaxed tracking-wide opacity-70 sm:pl-12 sm:pb-10 md:pl-32 md:text-base lg:pl-44 lg:pb-14 lg:text-lg"
                                                    style={{ color: themeColors.secondaryText }}
                                                >
                                                    {typeof faq.answer === 'string'
                                                        ? faq.answer
                                                        : <TiptapRenderer content={faq.answer} />
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
