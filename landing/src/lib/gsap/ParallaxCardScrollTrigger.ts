/**
 * ParallaxCardScrollTrigger.ts
 * 100vw x 100vh Screen-Wide Sticky Parallax Card ScrollTrigger Controller
 * Swiss Minimalist Sticky Card Stacking and Parallax Transitions
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export interface ParallaxCardOptions {
  triggerSelector?: string;
  start?: string;
  end?: string;
  pin?: boolean;
  pinSpacing?: boolean;
  scrub?: number | boolean;
  onUpdate?: (progress: number) => void;
}

export function registerGSAPPlugins(): void {
  if (typeof window !== 'undefined' && gsap) {
    gsap.registerPlugin(ScrollTrigger);
  }
}

export class ParallaxCardController {
  private triggers: ScrollTrigger[] = [];
  private isInitialized: boolean = false;

  constructor() {
    registerGSAPPlugins();
  }

  /**
   * Initializes sticky parallax card stacking behavior across elements matching selector.
   */
  public initParallaxCards(
    cardElements: HTMLElement[] | string = '.screen-wide-card',
    options: ParallaxCardOptions = {}
  ): void {
    if (typeof window === 'undefined') return;

    registerGSAPPlugins();

    let elements: HTMLElement[] = [];
    if (typeof cardElements === 'string') {
      elements = Array.from(document.querySelectorAll<HTMLElement>(cardElements));
    } else {
      elements = cardElements;
    }

    if (elements.length === 0) return;

    this.destroy(); // Clean existing triggers before re-binding

    elements.forEach((card, index) => {
      const isLast = index === elements.length - 1;

      // 1. Set sticky card CSS layout properties
      card.style.position = 'sticky';
      card.style.top = '0';
      card.style.minHeight = '100vh';
      card.style.width = '100vw';

      // 2. Create ScrollTrigger sticky pin timeline
      const st = ScrollTrigger.create({
        trigger: card,
        start: options.start ?? 'top top',
        end: isLast ? 'top top' : options.end ?? '+=100%',
        pin: !isLast && (options.pin ?? true),
        pinSpacing: options.pinSpacing ?? false,
        scrub: options.scrub ?? 1,
        onUpdate: (self) => {
          if (options.onUpdate) {
            options.onUpdate(self.progress);
          }
        },
      });

      this.triggers.push(st);

      // 3. Child element entrance animation (subtle upward translate and opacity fade)
      const animatedChildren = card.querySelectorAll('.parallax-animate');
      if (animatedChildren.length > 0) {
        gsap.fromTo(
          animatedChildren,
          { opacity: 0.3, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 80%',
              end: 'top 20%',
              scrub: 0.5,
            },
          }
        );
      }
    });

    this.isInitialized = true;
  }

  /**
   * Cleans up all ScrollTrigger instances and unbinds events.
   */
  public destroy(): void {
    this.triggers.forEach((st) => st.kill());
    this.triggers = [];
    this.isInitialized = false;
  }
}
