'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import gsap from 'gsap';
import { useThemeColors } from '@/app/hooks/useTheme';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';

interface ContactSideFormProps {
  isOpen: boolean;
  onClose: () => void;
}

function UnderlineField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs wb-text-on-light-secondary">{label}</label>
      {children}
    </div>
  );
}

export const ContactSideForm: React.FC<ContactSideFormProps> = ({ isOpen, onClose }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const colors = useThemeColors();
  const { site } = useWebBuilder();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    time: '',
    source: '',
    acceptedTerms: false,
  });

  const underlineClass =
    'w-full border-0 border-b border-[color-mix(in_srgb,var(--wb-primary)_35%,transparent)] bg-transparent py-1.5 text-sm wb-text-on-light outline-none transition-colors placeholder:opacity-40';

  const onFocusLine = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderBottomColor = 'var(--wb-primary)';
  };
  const onBlurLine = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderBottomColor =
      'color-mix(in srgb, var(--wb-primary) 35%, transparent)';
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const tl = gsap.timeline();
      tl.to(overlayRef.current, {
        opacity: 1,
        visibility: 'visible',
        duration: 0.5,
        ease: 'power2.out',
      }).to(
        formRef.current,
        { x: 0, duration: 0.8, ease: 'expo.out' },
        '-=0.3'
      );
    } else {
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = '';
        },
      });
      tl.to(formRef.current, { x: '100%', duration: 0.6, ease: 'expo.in' }).to(
        overlayRef.current,
        { opacity: 0, visibility: 'hidden', duration: 0.4 },
        '-=0.2'
      );
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          siteId: site?._id,
          subject: `Request for Information - ${formData.name}`,
          message: `Phone: ${formData.phone}\nCallback Time: ${formData.time}\nSource: ${formData.source}`,
        }),
      });

      if (response.ok) {
        setSubmitMessage('Sent successfully');
        setTimeout(() => {
          onClose();
          setSubmitMessage('');
          setFormData({
            name: '',
            email: '',
            phone: '',
            time: '',
            source: '',
            acceptedTerms: false,
          });
        }, 2000);
      } else {
        setSubmitMessage('Failed to send');
      }
    } catch {
      setSubmitMessage('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] overflow-hidden pointer-events-none">
      <div
        ref={overlayRef}
        onClick={onClose}
        className="absolute inset-0 opacity-0 invisible pointer-events-auto cursor-pointer"
        style={{ backgroundColor: 'color-mix(in srgb, var(--wb-text-main) 30%, transparent)' }}
        aria-hidden
      />

      <div
        ref={formRef}
        className="pointer-events-auto absolute top-0 right-0 flex h-full w-full max-w-[440px] translate-x-full flex-col overflow-hidden border-l shadow-[-12px_0_40px_color-mix(in_srgb,var(--wb-text-main)_8%,transparent)]"
        style={{
          backgroundColor: colors.sectionBackgroundLight,
          borderColor: 'color-mix(in srgb, var(--wb-primary) 10%, transparent)',
          color: colors.mainText,
          fontFamily: 'var(--wb-body-font, inherit)',
        }}
      >
        <div className="flex shrink-0 justify-end px-5 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="p-1 wb-text-on-light-secondary transition-colors hover:opacity-80"
            style={{ color: colors.primaryButton }}
            aria-label="Close form"
          >
            <X size={20} strokeWidth={1.25} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-center overflow-hidden px-6 pb-6 md:px-8">
          <div className="mx-auto w-full max-w-[360px]">
            <header className="mb-5 space-y-2">
              <h2
                className="text-[1.45rem] font-semibold leading-[1.15] md:text-[1.6rem]"
                style={{
                  fontFamily: 'var(--wb-heading-font, Georgia, serif)',
                  background: `linear-gradient(135deg, ${colors.mainText} 0%, ${colors.primaryButton} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Would you like
                <br />
                more information?
              </h2>
              <p className="text-xs leading-snug wb-text-on-light-secondary">
                If you have any questions, tell us when it is better for us to call you.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4">
              <UnderlineField label="Name and surname">
                <input
                  type="text"
                  required
                  className={underlineClass}
                  onFocus={onFocusLine}
                  onBlur={onBlurLine}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </UnderlineField>

              <UnderlineField label="Mail">
                <input
                  type="email"
                  required
                  className={underlineClass}
                  onFocus={onFocusLine}
                  onBlur={onBlurLine}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </UnderlineField>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <UnderlineField label="Telephone">
                  <input
                    type="tel"
                    className={underlineClass}
                    onFocus={onFocusLine}
                    onBlur={onBlurLine}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </UnderlineField>

                <UnderlineField label="Preferable time">
                  <input
                    type="text"
                    className={underlineClass}
                    onFocus={onFocusLine}
                    onBlur={onBlurLine}
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </UnderlineField>
              </div>

              <UnderlineField label="Where did you find us">
                <input
                  type="text"
                  className={underlineClass}
                  onFocus={onFocusLine}
                  onBlur={onBlurLine}
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                />
              </UnderlineField>

              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 shrink-0 rounded border accent-[var(--wb-primary)]"
                  style={{
                    borderColor: 'color-mix(in srgb, var(--wb-primary) 40%, transparent)',
                  }}
                  required
                  checked={formData.acceptedTerms}
                  onChange={(e) =>
                    setFormData({ ...formData, acceptedTerms: e.target.checked })
                  }
                />
                <span className="text-[10px] font-medium uppercase leading-snug tracking-[0.06em] wb-text-on-light-secondary">
                  I accept the{' '}
                  <Link
                    href="/privacy-policy"
                    className="underline underline-offset-2 transition-opacity hover:opacity-80"
                    style={{ color: colors.primaryButton }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    privacy policy
                  </Link>
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center py-3.5 text-xs font-bold uppercase tracking-[0.35em] transition-all duration-300 hover:opacity-95 hover:shadow-lg active:scale-[0.995] disabled:opacity-55"
                style={{
                  backgroundColor: colors.primaryButton,
                  color: 'var(--wb-text-on-dark, #fff)',
                }}
              >
                {isSubmitting ? 'Sending…' : submitMessage || 'Send'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSideForm;
