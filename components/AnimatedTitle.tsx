'use client';

import { cn } from '@/app/lib/utils';

export const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
export const ENTRANCE = '1.1s';

export function splitTitleLines(title: string): string[] {
  const lines = title
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length ? lines : [title.trim() || ''];
}

interface TitlePartProps {
  text: string;
  delay: number;
  loaded: boolean;
  fromLeft?: boolean;
  className?: string;
}

export function TitlePart({
  text,
  delay,
  loaded,
  fromLeft = true,
  className,
}: TitlePartProps) {
  const offset = fromLeft ? '-48px' : '48px';

  return (
    <span
      className={cn('block overflow-hidden pb-[0.12em]', className)}
      style={{
        opacity: loaded ? 1 : 0,
        transform: loaded ? 'translateX(0)' : `translateX(${offset})`,
        transition: `opacity 0.9s ${EASE}, transform 0.9s ${EASE}`,
        transitionDelay: `${delay}s`,
      }}
    >
      {text}
    </span>
  );
}

interface AnimatedHeadingProps {
  title: string;
  loaded: boolean;
  baseDelay?: number;
  className?: string;
  lightSweep?: boolean;
}

export function AnimatedHeading({
  title,
  loaded,
  baseDelay = 0.2,
  className,
  lightSweep = false,
}: AnimatedHeadingProps) {
  const lines = splitTitleLines(title);
  const sizeClass =
    title.length > 45
      ? 'text-[clamp(1.75rem,4vw,3rem)]'
      : title.length > 30
        ? 'text-[clamp(2rem,4.5vw,3.5rem)]'
        : 'text-[clamp(2.25rem,5vw,4rem)]';

  return (
    <h2
      className={cn(
        'relative font-normal leading-[1.1] tracking-tight text-[var(--wb-text-main)]',
        sizeClass,
        lightSweep && 'bg-clip-text text-transparent',
        className
      )}
      style={{
        fontFamily: 'var(--wb-heading-font, Georgia, serif)',
        ...(lightSweep
          ? {
              backgroundImage:
                'linear-gradient(110deg, var(--wb-text-main) 40%, color-mix(in srgb, var(--wb-primary) 70%, var(--wb-text-main)) 50%, var(--wb-text-main) 60%)',
              backgroundSize: '200% 100%',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: loaded ? 'title-light-sweep 2.4s ease-out 0.6s forwards' : undefined,
            }
          : undefined),
      }}
    >
      {lines.map((line, index) => (
        <TitlePart
          key={`${line}-${index}`}
          text={line}
          delay={baseDelay + index * 0.15}
          loaded={loaded}
          fromLeft={index % 2 === 0}
        />
      ))}
      {lightSweep && (
        <style jsx global>{`
          @keyframes title-light-sweep {
            from {
              background-position: 100% 0;
            }
            to {
              background-position: -100% 0;
            }
          }
        `}</style>
      )}
    </h2>
  );
}
