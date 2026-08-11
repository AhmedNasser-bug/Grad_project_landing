/**
 * TextSplitUtil.ts
 * Headline SplitText Reveal & Text Morph Animation Utility
 * Optimized for Giant Swiss Minimalist Clamp Typography (clamp(2.8rem, 5vw, 5.5rem))
 */

import { gsap } from 'gsap';

export interface TextRevealOptions {
  staggerDelay?: number; // default 0.02s
  duration?: number; // default 0.8s
  ease?: string; // default 'power3.out'
  yOffset?: number; // default 35px
  splitType?: 'words' | 'chars' | 'lines';
  onComplete?: () => void;
}

export class TextSplitUtil {
  /**
   * Splits element inner text into span wrappers for word/character stagger animation.
   */
  public static splitText(
    element: HTMLElement,
    splitType: 'words' | 'chars' = 'words'
  ): HTMLElement[] {
    const originalText = element.innerText;
    element.innerHTML = '';

    if (splitType === 'words') {
      const words = originalText.split(/\s+/);
      const spanElements: HTMLElement[] = [];

      words.forEach((word) => {
        const wrapper = document.createElement('span');
        wrapper.className = 'inline-block overflow-hidden mr-[0.25em] align-top';

        const innerSpan = document.createElement('span');
        innerSpan.className = 'inline-block text-reveal-word';
        innerSpan.innerText = word;

        wrapper.appendChild(innerSpan);
        element.appendChild(wrapper);
        spanElements.push(innerSpan);
      });

      return spanElements;
    } else {
      const chars = Array.from(originalText);
      const spanElements: HTMLElement[] = [];

      chars.forEach((char) => {
        const innerSpan = document.createElement('span');
        innerSpan.className = 'inline-block text-reveal-char';
        innerSpan.innerText = char === ' ' ? '\u00A0' : char;

        element.appendChild(innerSpan);
        spanElements.push(innerSpan);
      });

      return spanElements;
    }
  }

  /**
   * Animates headline entrance using GSAP staggered reveal.
   */
  public static revealHeadline(
    element: HTMLElement | string,
    options: TextRevealOptions = {}
  ): gsap.core.Timeline | null {
    if (typeof window === 'undefined') return null;

    let targetElement: HTMLElement | null = null;
    if (typeof element === 'string') {
      targetElement = document.querySelector<HTMLElement>(element);
    } else {
      targetElement = element;
    }

    if (!targetElement) return null;

    const staggerDelay = options.staggerDelay ?? 0.02;
    const duration = options.duration ?? 0.8;
    const ease = options.ease ?? 'power3.out';
    const yOffset = options.yOffset ?? 35;
    const splitType = options.splitType === 'chars' ? 'chars' : 'words';

    const spans = this.splitText(targetElement, splitType);

    const tl = gsap.timeline({
      onComplete: options.onComplete,
    });

    tl.fromTo(
      spans,
      {
        opacity: 0,
        y: yOffset,
        rotateX: -15,
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: duration,
        stagger: staggerDelay,
        ease: ease,
      }
    );

    return tl;
  }

  /**
   * Morph transition from current text to new text.
   */
  public static morphHeadline(
    element: HTMLElement | string,
    newText: string,
    options: TextRevealOptions = {}
  ): void {
    if (typeof window === 'undefined') return;

    let targetElement: HTMLElement | null = null;
    if (typeof element === 'string') {
      targetElement = document.querySelector<HTMLElement>(element);
    } else {
      targetElement = element;
    }

    if (!targetElement) return;

    // Fade out current text
    gsap.to(targetElement, {
      opacity: 0,
      y: -15,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        targetElement!.innerText = newText;
        gsap.set(targetElement, { opacity: 1, y: 0 });
        this.revealHeadline(targetElement!, options);
      },
    });
  }
}
