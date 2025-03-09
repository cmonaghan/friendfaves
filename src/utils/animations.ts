
import { RefObject, useEffect } from 'react';

/**
 * Hook to apply a staggered animation to a set of elements
 */
export const useStaggeredAnimation = (
  containerRef: RefObject<HTMLElement>, 
  delay = 100, 
  initialDelay = 0
) => {
  useEffect(() => {
    if (!containerRef.current) return;
    
    const items = containerRef.current.querySelectorAll('.opacity-0');
    
    if (items.length === 0) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            observer.unobserve(element);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    setTimeout(() => {
      items.forEach((item, index) => {
        setTimeout(() => {
          observer.observe(item);
        }, index * delay);
      });
    }, initialDelay);
    
    return () => {
      items.forEach(item => {
        observer.unobserve(item);
      });
    };
  }, [containerRef, delay, initialDelay]);
};
