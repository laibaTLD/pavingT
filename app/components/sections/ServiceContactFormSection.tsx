'use client';

import React, { useState } from 'react';
import { Page, BusinessHours } from '@/app/lib/types';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { cn } from '@/app/lib/utils';
import { ArrowRight } from 'lucide-react';
import { ContactSideForm } from '@/app/components/ui/ContactSideForm';

const DAY_LABELS: Record<string, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun'
};

interface ServiceContactFormSectionProps {
    service: any;
}

export const ServiceContactFormSection: React.FC<ServiceContactFormSectionProps> = ({ service }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const themeColors = useThemeColors();
  const themeFonts = useThemeFonts();
  const { site } = useWebBuilder();

  if (!service.contactForm?.enabled) return null;

  const business = site?.business;
  const address = business?.address;
  const businessHours = business?.businessHours;
  const safeBusinessHours = Array.isArray(businessHours?.hours) ? businessHours.hours : [];
  const hasValidCoordinates =
    typeof site?.business?.coordinates?.latitude === 'number' &&
    typeof site?.business?.coordinates?.longitude === 'number';
  
  const formatTime = (time: string) => {
    if (!time) return '';
    if (businessHours?.displayFormat === '12h') {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      if (Number.isNaN(hour) || !minutes) return time;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    }
    return time;
  };

  const formatDayHours = (dayHours: BusinessHours) => {
    if (!dayHours.isOpen) return 'Closed';
    if (dayHours.is24Hours) return '24h';
    if (Array.isArray(dayHours.timeRanges) && dayHours.timeRanges.length > 0) {
      return dayHours.timeRanges
      .filter((range) => range?.openTime && range?.closeTime)
      .map(range => 
        `${formatTime(range.openTime)} - ${formatTime(range.closeTime)}`
      ).join(', ');
    }
    return 'Hours unavailable';
  };

  return (
    <section 
      className="flex flex-col gap-16 py-14 sm:gap-24 sm:py-20 md:py-32 lg:gap-48 lg:py-40" 
      style={{ backgroundColor: themeColors.pageBackground, fontFamily: themeFonts.body }}
    >
      
      {/* PART 1: "ANY QUESTIONS?" CALL TO ACTION */}
      <div className="container mx-auto flex flex-col items-center px-5 text-center sm:px-6">
        <div className="mb-10 max-w-4xl space-y-4 text-center sm:mb-16 md:mb-20">
          <h2 
            className="text-2xl font-extralight uppercase leading-[1.1] tracking-[0.12em] break-words sm:text-3xl md:text-5xl md:tracking-[0.15em] lg:text-7xl"
            style={{ fontFamily: themeFonts.heading, color: themeColors.mainText }}
          >
            Any questions?<br />
            Simply ask us.
          </h2>
          <h3 
            className="text-2xl font-light uppercase italic tracking-[0.12em] break-words sm:text-3xl md:text-5xl md:tracking-[0.15em] lg:text-7xl"
            style={{ 
                fontFamily: themeFonts.heading, 
                color: themeColors.primaryButton 
            }}
          >
           {service.name}
          </h3>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="group relative flex w-full max-w-[320px] items-center justify-between overflow-hidden px-8 py-5 text-left transition-all duration-500 sm:px-10 sm:py-6"
          style={{ backgroundColor: themeColors.primaryButton, color: themeColors.darkPrimaryText }}
        >
          <span className="z-10 text-[11px] font-bold uppercase tracking-[0.4em]">Get a Quote</span>
          <ArrowRight size={20} className="z-10 transition-transform group-hover:translate-x-1" />
          <div className="absolute inset-0 translate-y-full bg-[color-mix(in_srgb,var(--wb-page-bg)_10%,transparent)] transition-transform duration-500 group-hover:translate-y-0" />
        </button>
      </div>

      {/* Slide-out Form Component */}
      <ContactSideForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />

      {/* PART 2: "WHERE TO FIND US" MAP SECTION */}
      <div className="container mx-auto grid grid-cols-1 items-start gap-10 px-5 sm:gap-14 sm:px-6 md:px-12 lg:grid-cols-2 lg:gap-24">
        
        {/* Left: Info */}
        <div className="min-w-0 space-y-10 sm:space-y-16">
          <h2 
            className="text-2xl font-extralight uppercase leading-tight tracking-[0.16em] break-words sm:text-3xl md:text-5xl md:tracking-[0.2em]"
            style={{ fontFamily: themeFonts.heading, color: themeColors.mainText }}
          >
            Where to<br />find us
          </h2>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12 lg:gap-20">
            {/* Address */}
            <div className="min-w-0 space-y-6">
              <div className="space-y-1">
                <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.2em] opacity-30">Head Office</span>
                <p className="max-w-sm text-sm font-light uppercase leading-relaxed tracking-wide opacity-80 break-words md:text-base">
                  {address?.street || 'Avda. Valdemarín 86'}<br />
                  {address?.city || 'Aravaca'}, {address?.zipCode || '28023'}
                </p>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address?.street || ''} ${address?.city || ''}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative mt-6 flex w-full max-w-[220px] items-center justify-between overflow-hidden px-8 py-4 transition-all duration-500 sm:mt-8"
                style={{ backgroundColor: themeColors.primaryButton, color: themeColors.darkPrimaryText }}
              >
                <span className="z-10 text-[10px] font-bold uppercase tracking-[0.3em]">View Map</span>
                <ArrowRight size={18} className="z-10 transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 translate-y-full bg-[color-mix(in_srgb,var(--wb-page-bg)_10%,transparent)] transition-transform duration-500 group-hover:translate-y-0" />
              </a>
            </div>

            {/* Business Hours */}
            {businessHours?.isEnabled && safeBusinessHours.length > 0 && (
              <div className="min-w-0 space-y-6">
                <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.2em] opacity-30">Business Hours</span>
                <div className="space-y-2">
                  {safeBusinessHours.filter(Boolean).map((day: any) => (
                    <div key={day.day} className="flex items-baseline justify-between gap-3 text-[11px] font-light uppercase tracking-widest opacity-80">
                      <span className="shrink-0 font-semibold opacity-60">{DAY_LABELS[day.day] || day.day}</span>
                      <span className="min-w-0 text-right break-words">{formatDayHours(day)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Architectural Map Overlay */}
        <div className="relative aspect-[16/10] w-full overflow-hidden shadow-2xl md:aspect-video lg:mt-12 lg:aspect-[4/3]">
          {hasValidCoordinates ? (
              <div className="h-full w-full scale-100 grayscale-[0.9] contrast-[1.1] brightness-[1.1] transition-all duration-1000 hover:grayscale-0">
                <iframe
                  title="Office Location"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0, filter: 'grayscale(1) contrast(1.2) opacity(0.8)' }}
                  src={`https://maps.google.com/maps?q=${site.business.coordinates.latitude},${site.business.coordinates.longitude}&z=15&output=embed`}
                  allowFullScreen
                  loading="lazy"
                />
              </div>
          ) : (
             <div className="flex h-full w-full items-center justify-center bg-[var(--wb-page-bg)] grayscale">
                <span className="text-[10px] uppercase italic tracking-[0.5em] opacity-30">Satellite View Pending</span>
             </div>
          )}
          
          {/* Subtle architectural frame */}
          <div className="pointer-events-none absolute inset-0 border-[12px] border-white/5 sm:border-[20px]" />
        </div>
      </div>
    </section>
  );
};

export default ServiceContactFormSection;
