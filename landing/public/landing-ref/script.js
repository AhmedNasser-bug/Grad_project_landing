(() => {
  const header = document.getElementById("site-header");
  const menuToggle = document.querySelector(".menu-toggle-pill");
  const mobileDrawer = document.getElementById("mobile-pill-drawer");
  const pillDock = document.getElementById("primary-navigation");
  const pillGlider = pillDock ? pillDock.querySelector(".nav-pill-glider") : null;
  const navLinks = Array.from(document.querySelectorAll(".nav-pill-link"));
  const mobileLinks = Array.from(document.querySelectorAll(".mobile-pill-link"));

  // ── MOBILE PILL DRAWER ────────────────────────────────────────────────
  function closeMenu() {
    if (!menuToggle || !mobileDrawer) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    mobileDrawer.setAttribute("aria-hidden", "true");
    mobileDrawer.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  }

  if (menuToggle && mobileDrawer) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
      mobileDrawer.setAttribute("aria-hidden", String(isOpen));
      mobileDrawer.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("menu-open", !isOpen);
    });

    mobileDrawer.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("a")) closeMenu();
    });

    document.addEventListener("click", (event) => {
      if (
        mobileDrawer.classList.contains("is-open") &&
        header &&
        !header.contains(event.target)
      ) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 960) closeMenu();
    });
  }

  // ── BUBBLY PILL SLIDING GLIDER + SCROLLSPY ────────────────────────────
  let activeId = "";
  let hoveredLink = null;

  function moveGliderTo(targetEl) {
    if (!pillDock || !pillGlider) return;
    if (!targetEl) {
      pillGlider.style.opacity = "0";
      return;
    }
    pillGlider.style.width = `${targetEl.offsetWidth}px`;
    pillGlider.style.transform = `translateX(${targetEl.offsetLeft}px)`;
    pillGlider.style.opacity = "1";
  }

  function syncActiveNav(nextId) {
    activeId = nextId;
    let activeLink = null;
    navLinks.forEach((link) => {
      const isMatch = link.getAttribute("href") === `#${nextId}`;
      link.classList.toggle("is-active", isMatch);
      if (isMatch) activeLink = link;
    });
    mobileLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${nextId}`);
    });
    if (!hoveredLink) moveGliderTo(activeLink);
  }

  if (pillDock && pillGlider && navLinks.length) {
    navLinks.forEach((link) => {
      link.addEventListener("mouseenter", () => {
        hoveredLink = link;
        moveGliderTo(link);
      });
      link.addEventListener("focus", () => {
        hoveredLink = link;
        moveGliderTo(link);
      });
    });

    pillDock.addEventListener("mouseleave", () => {
      hoveredLink = null;
      const activeLink = navLinks.find((l) => l.classList.contains("is-active")) || null;
      moveGliderTo(activeLink);
    });

    pillDock.addEventListener("focusout", (event) => {
      if (!pillDock.contains(event.relatedTarget)) {
        hoveredLink = null;
        const activeLink = navLinks.find((l) => l.classList.contains("is-active")) || null;
        moveGliderTo(activeLink);
      }
    });

    window.addEventListener("resize", () => {
      const target = hoveredLink || navLinks.find((l) => l.classList.contains("is-active")) || null;
      moveGliderTo(target);
    });
  }

  const trackedIds = ["services", "features", "repositories", "about", "faq", "pricing"];
  const trackedSections = trackedIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function updateScrollSpy() {
    if (!trackedSections.length) return;
    const probeY = window.innerHeight * 0.36;
    let current = "";
    for (const sec of trackedSections) {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= probeY && rect.bottom > 100) {
        current = sec.id;
      }
    }
    if (current !== activeId) {
      syncActiveNav(current);
    }
  }

  window.addEventListener("scroll", updateScrollSpy, { passive: true });
  updateScrollSpy();

  // ── HERO DASHBOARD NATIVE STAGE SCALING ───────────────────────────────
  const heroFrame = document.querySelector(".hero-dash-frame");
  const heroStage = heroFrame ? heroFrame.querySelector(".ng-dash-stage") : null;

  function scaleHeroDash() {
    if (!heroFrame || !heroStage) return;
    const scale = heroFrame.clientWidth / 1280;
    heroStage.style.transform = `scale(${scale})`;
  }

  if (heroFrame && heroStage) {
    scaleHeroDash();
    if ("ResizeObserver" in window) {
      const ro = new ResizeObserver(scaleHeroDash);
      ro.observe(heroFrame);
    } else {
      window.addEventListener("resize", scaleHeroDash);
    }
  }

  // ── FAST NON-BLOCKING LAPTOP BOOT SEQUENCE ────────────────────────────
  const bootOverlay = document.querySelector("[data-ng-boot]");
  if (bootOverlay) {
    const bootBar = bootOverlay.querySelector("[data-ng-boot-bar]");
    const bootStatus = bootOverlay.querySelector("[data-ng-boot-status]");
    let finished = false;
    const timers = [];

    const finishBoot = () => {
      if (finished) return;
      finished = true;
      timers.forEach((t) => window.clearTimeout(t));
      if (bootBar) bootBar.style.width = "100%";
      if (bootStatus) bootStatus.textContent = "Workspace ready";
      window.setTimeout(() => {
        bootOverlay.classList.add("is-done");
      }, 90);
    };

    timers.push(
      window.setTimeout(() => {
        if (bootBar) bootBar.style.width = "42%";
      }, 60),
      window.setTimeout(() => {
        if (bootBar) bootBar.style.width = "82%";
        if (bootStatus) bootStatus.textContent = "Syncing ward roster...";
      }, 420),
      window.setTimeout(finishBoot, 980),
    );

    window.addEventListener("ng:skip-boot", finishBoot, { once: true });
    window.addEventListener(
      "scroll",
      () => {
        if (window.scrollY > 12) finishBoot();
      },
      { passive: true },
    );
  }

  // ── FAQ SINGLE-OPEN ACCORDION ─────────────────────────────────────────
  document.querySelectorAll(".faq-item").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      document.querySelectorAll(".faq-item[open]").forEach((openItem) => {
        if (openItem !== item) openItem.open = false;
      });
    });
  });
})();
