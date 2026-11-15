(() => {
  const intro = document.querySelector(".cinematic-intro");
  const header = document.getElementById("site-header");

  if (!intro) {
    if (header) header.classList.add("is-light");
    return;
  }

  if (!window.gsap || !window.ScrollTrigger) {
    intro.hidden = true;
    if (header) header.classList.add("is-light");
    return;
  }

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  const laptop = intro.querySelector(".laptop");
  const laptopScreen = intro.querySelector(".laptop-screen");
  const laptopBezelBg = intro.querySelector(".laptop-bezel-bg");
  const screenContent = intro.querySelector(".laptop-screen-content");
  const laptopCamera = intro.querySelector(".laptop-camera");
  const laptopGlare = intro.querySelector(".laptop-glass-glare");
  const laptopBase = intro.querySelector(".laptop-base");
  const laptopHinge = intro.querySelector(".laptop-hinge");
  const laptopShadow = intro.querySelector(".laptop-shadow");
  const background = intro.querySelector(".workspace-background");
  const shade = intro.querySelector(".workspace-shade");
  const whiteVeil = intro.querySelector(".cinematic-white-veil");
  const copy = intro.querySelector(".cinematic-copy");
  const scrollCue = intro.querySelector(".cinematic-scroll-cue");

  const metrics = {
    restScale: 0.38,
    peakScale: 0.96,
    verticalOffset: 0,
    scrollDistance: 1400,
  };

  const media = gsap.matchMedia();

  media.add(
    {
      desktop: "(min-width: 701px) and (prefers-reduced-motion: no-preference)",
      mobile: "(max-width: 700px) and (prefers-reduced-motion: no-preference)",
      reducedMotion: "(prefers-reduced-motion: reduce)",
    },
    ({ conditions }) => {
      if (conditions.reducedMotion) {
        intro.hidden = true;
        if (header) header.classList.add("is-light");
        return;
      }

      intro.hidden = false;

      const updateMetrics = () => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const introHeight = intro.offsetHeight || vh;

        const baseLaptopW = laptop.offsetWidth || (conditions.mobile ? 1320 : 1328);
        const targetRestWidth = conditions.mobile
          ? Math.min(vw * 0.86, 430)
          : vw <= 1100
            ? Math.min(vw * 0.44, 460)
            : Math.min(vw * 0.34, 520);

        metrics.restScale = targetRestWidth / baseLaptopW;
        metrics.scrollDistance = Math.round(introHeight * (conditions.mobile ? 1.35 : 1.75));
        intro.style.marginBottom = `${Math.max(0, metrics.scrollDistance - introHeight)}px`;

        const screenW = screenContent.clientWidth || 1280;
        const screenH = screenContent.clientHeight || 800;
        const maxShowcaseW = vw * (conditions.mobile ? 0.94 : 0.9);
        const maxShowcaseH = vh * (conditions.mobile ? 0.72 : 0.78);
        metrics.peakScale = Math.min(maxShowcaseW / screenW, maxShowcaseH / screenH);

        const screenCenterX = laptopScreen.offsetLeft + screenContent.offsetLeft + screenW / 2;
        const screenCenterY = laptopScreen.offsetTop + screenContent.offsetTop + screenH / 2;

        gsap.set(laptop, {
          transformOrigin: `${screenCenterX}px ${screenCenterY}px`,
          scale: metrics.restScale,
          y: 0,
        });

        const introRect = intro.getBoundingClientRect();
        const screenRect = screenContent.getBoundingClientRect();
        const startCenterY = screenRect.top - introRect.top + screenRect.height / 2;
        const headerBias = conditions.mobile ? 18 : 26;
        metrics.verticalOffset = introHeight / 2 - startCenterY + headerBias;
      };

      updateMetrics();
      ScrollTrigger.addEventListener("refreshInit", updateMetrics);

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: intro,
          start: "top top",
          end: () => `+=${metrics.scrollDistance}`,
          pin: true,
          pinSpacing: false,
          scrub: 0.65,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            if (header) {
              header.classList.toggle("is-light", p >= 0.42);
            }
            if (p > 0.02) {
              window.dispatchEvent(new CustomEvent("ng:skip-boot"));
            }
            intro.style.pointerEvents = p > 0.86 ? "none" : "";
          },
          onRefresh: (self) => {
            if (header) {
              header.classList.toggle("is-light", self.progress >= 0.42);
            }
          },
        },
      });

      // Stage 1: Lift intro copy, scroll cue, and glare cleanly
      timeline.to(copy, { autoAlpha: 0, y: -34, duration: 0.2, ease: "power2.out" }, 0);
      timeline.to(scrollCue, { autoAlpha: 0, y: 10, duration: 0.14, ease: "power2.out" }, 0);
      if (laptopGlare) {
        timeline.to(laptopGlare, { autoAlpha: 0, duration: 0.24, ease: "power1.out" }, 0);
      }

      // Stage 2: Smoothly elevate & expand laptop dashboard to razor-sharp 1x showcase
      timeline.fromTo(
        laptop,
        { scale: () => metrics.restScale, y: 0, autoAlpha: 1 },
        {
          scale: () => metrics.peakScale,
          y: () => metrics.verticalOffset,
          duration: 0.6,
          ease: "power2.inOut",
        },
        0.02,
      );
      timeline.to(background, { scale: 1.1, duration: 0.6, ease: "power1.out" }, 0);

      // Hardware chassis dissolves cleanly into floating clinical card
      const hardwareParts = [laptopBase, laptopHinge, laptopShadow, laptopCamera].filter(Boolean);
      if (hardwareParts.length) {
        timeline.to(hardwareParts, { autoAlpha: 0, duration: 0.22, ease: "power2.out" }, 0.26);
      }

      timeline.to(shade, { autoAlpha: 0, duration: 0.22, ease: "power1.inOut" }, 0.34);
      if (laptopBezelBg) {
        timeline.to(laptopBezelBg, { autoAlpha: 0, duration: 0.22, ease: "power2.inOut" }, 0.36);
      }
      if (whiteVeil) {
        timeline.to(whiteVeil, { opacity: 1, duration: 0.24, ease: "power2.inOut" }, 0.36);
      }

      timeline.to(
        screenContent,
        {
          boxShadow: "0 26px 68px -18px rgba(18, 52, 78, 0.2), 0 0 0 1px rgba(210, 224, 234, 0.95)",
          duration: 0.24,
          ease: "power2.inOut",
        },
        0.36,
      );

      // Stage 3: Zoomed card dissolves into white BEFORE white veil reveals .hero (zero ghost overlap)
      timeline.to(
        laptop,
        {
          y: () => metrics.verticalOffset - 32,
          scale: () => metrics.peakScale * 0.96,
          autoAlpha: 0,
          duration: 0.16,
          ease: "power2.in",
        },
        0.68,
      );
      timeline.to(
        intro,
        {
          autoAlpha: 0,
          duration: 0.16,
          ease: "power2.out",
        },
        0.84,
      );

      return () => {
        ScrollTrigger.removeEventListener("refreshInit", updateMetrics);
        timeline.scrollTrigger?.kill();
        timeline.kill();
        intro.style.removeProperty("margin-bottom");
        intro.style.removeProperty("pointer-events");
      };
    },
  );

  window.addEventListener("pagehide", () => media.revert(), { once: true });
})();
