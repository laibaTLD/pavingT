'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollAnimationOptions = {}
) {
  const { threshold = 0.1, rootMargin = '0px 0px -50px 0px', triggerOnce = true } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [node, setNode] = useState<T | null>(null);
  const triggeredRef = useRef(false);
  const optionsKeyRef = useRef(`${threshold}|${rootMargin}|${triggerOnce}`);

  const ref = useCallback((el: T | null) => {
    setNode(el);
  }, []);

  useLayoutEffect(() => {
    const nextKey = `${threshold}|${rootMargin}|${triggerOnce}`;
    if (optionsKeyRef.current !== nextKey) {
      optionsKeyRef.current = nextKey;
      triggeredRef.current = false;
      setIsVisible(false);
    }

    if (!node) return;
    if (triggerOnce && triggeredRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          triggeredRef.current = true;
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(entry.target);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [node, threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
}

export function useStaggeredAnimation(itemCount: number, delay = 100) {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const { ref, isVisible } = useScrollAnimation();

  useEffect(() => {
    if (!isVisible) return;

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < itemCount; i++) {
      const timeout = setTimeout(() => {
        setVisibleItems((prev) => [...prev, i]);
      }, i * delay);
      timeouts.push(timeout);
    }

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [isVisible, itemCount, delay]);

  return { ref, visibleItems, isVisible };
}
