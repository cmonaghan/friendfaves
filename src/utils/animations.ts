
import { RefObject, useEffect, useState } from 'react';

// Custom hook for staggered animations
export function useStaggeredAnimation(
  ref: RefObject<HTMLElement>,
  delayIncrement: number = 50,
  baseDelay: number = 100
) {
  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const elements = Array.from(container.children);
    
    elements.forEach((element, index) => {
      const delay = baseDelay + index * delayIncrement;
      (element as HTMLElement).style.opacity = '0';
      (element as HTMLElement).style.transform = 'translateY(10px)';
      
      setTimeout(() => {
        (element as HTMLElement).style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        (element as HTMLElement).style.opacity = '1';
        (element as HTMLElement).style.transform = 'translateY(0)';
      }, delay);
    });
  }, [ref, delayIncrement, baseDelay]);
}

// Custom hook for intersection observer animations
export function useIntersectionAnimation(
  threshold: number = 0.1
) {
  const [observedElements, setObservedElements] = useState<Element[]>([]);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-up');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );
    
    observedElements.forEach((el) => observer.observe(el));
    
    return () => {
      observedElements.forEach((el) => observer.unobserve(el));
    };
  }, [observedElements, threshold]);
  
  const observe = (element: Element) => {
    if (element && !observedElements.includes(element)) {
      setObservedElements(prev => [...prev, element]);
    }
  };
  
  return { observe };
}
