import NextImage, { type ImageProps } from 'next/image';
import { forwardRef } from 'react';
import { IMAGE_QUALITY, IMAGE_SIZES } from '@/app/lib/imageDefaults';
import { cn } from '@/app/lib/utils';

export type OptimizedImageProps = Omit<ImageProps, 'src'> & {
  src: string;
};

/** CMS uploads are already compressed WebP/AVIF — skip Vercel transforms (avoids 402 quota). */
function isCmsUploadUrl(src: string): boolean {
  try {
    const pathname = src.startsWith('http')
      ? new URL(src).pathname
      : src.split('?')[0] || '';
    return (
      pathname.includes('/api/uploads/') ||
      pathname.includes('/uploads/') ||
      /\.(webp|avif)(\?|#|$)/i.test(src)
    );
  } catch {
    return /\.(webp|avif)(\?|#|$)/i.test(src);
  }
}

function useNativeImgElement(src: string, unoptimized?: boolean): boolean {
  if (!src || unoptimized) return true;
  if (src.startsWith('data:') || src.startsWith('blob:')) return true;
  if (/\.svg(\?|#|$)/i.test(src)) return true;
  return false;
}

/**
 * Wrapper around next/image: WebP/AVIF, default quality 90, sensible size hints for CMS URLs.
 * Remote CMS uploads skip Vercel Image Optimization to avoid production 402 quota errors.
 */
export const OptimizedImage = forwardRef<HTMLImageElement | null, OptimizedImageProps>(
  function OptimizedImage(
    {
      src,
      alt = '',
      className,
      fill,
      width,
      height,
      sizes,
      style,
      quality = IMAGE_QUALITY,
      unoptimized,
      ...rest
    },
    ref
  ) {
    if (!src) return null;

    const skipOptimizer = Boolean(unoptimized) || isCmsUploadUrl(src);

    if (useNativeImgElement(src, skipOptimizer)) {
      return (
        <img
          ref={ref}
          src={src}
          alt={alt}
          className={className}
          style={
            fill
              ? {
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  ...style,
                }
              : style
          }
          loading={rest.priority ? undefined : 'lazy'}
          decoding="async"
        />
      );
    }

    const { loading: _omitLoading, ...imageRest } = rest;
    void _omitLoading;

    if (fill) {
      return (
        <NextImage
          ref={ref}
          src={src}
          alt={alt}
          fill
          quality={quality}
          sizes={sizes ?? IMAGE_SIZES.sectionWide}
          className={cn('object-cover', className)}
          style={style}
          {...imageRest}
        />
      );
    }

    const w = width ?? 1200;
    const h = height ?? 800;

    return (
      <NextImage
        ref={ref}
        src={src}
        alt={alt}
        width={w}
        height={h}
        quality={quality}
        sizes={sizes ?? IMAGE_SIZES.content}
        className={cn('h-auto max-w-full', className)}
        style={style}
        {...imageRest}
      />
    );
  }
);

export { IMAGE_QUALITY, IMAGE_QUALITY_HIGH, IMAGE_SIZES } from '@/app/lib/imageDefaults';
