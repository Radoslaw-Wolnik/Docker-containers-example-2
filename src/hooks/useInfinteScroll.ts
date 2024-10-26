// src/hooks/useInfiniteScroll.ts
import { useRef, useCallback, useEffect } from "react";
interface UseInfiniteScrollOptions {
    onIntersect: () => void;
    enabled?: boolean;
    threshold?: number;
    rootMargin?: string;
  }
  
  export function useInfiniteScroll<T extends HTMLElement>({
    onIntersect,
    enabled = true,
    threshold = 0.5,
    rootMargin = '100px'
  }: UseInfiniteScrollOptions) {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const elementRef = useRef<T | null>(null);
  
    const setRef = useCallback((node: T | null) => {
      if (elementRef.current) {
        // Cleanup old observer
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      }
  
      elementRef.current = node;
  
      if (node && enabled) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) {
              onIntersect();
            }
          },
          { threshold, rootMargin }
        );
  
        observerRef.current.observe(node);
      }
    }, [enabled, onIntersect, threshold, rootMargin]);
  
    useEffect(() => {
      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }, []);
  
    return setRef;
  }