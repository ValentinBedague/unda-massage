function getNamespace() {
  const main = document.querySelector("[data-barba=\"container\"]");
  return main ? main.getAttribute("data-barba-namespace") || "" : "";
}

function setupHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const setHeaderHeight = () => {
    document.documentElement.style.setProperty("--header-height", header.offsetHeight + "px");
  };

  setHeaderHeight();
  window.addEventListener("resize", setHeaderHeight);

  let lastY = window.scrollY;
  let ticking = false;
  let headerHidden = false;
  let hideTimeoutId = null;
  let showTimeoutId = null;

  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) > 8) {
        const hide = y > lastY && y > 40;

        if (hide !== headerHidden) {
          // Annuler d'éventuels timers précédents
          if (hideTimeoutId) {
            clearTimeout(hideTimeoutId);
            hideTimeoutId = null;
          }
          if (showTimeoutId) {
            clearTimeout(showTimeoutId);
            showTimeoutId = null;
          }

          if (hide) {
            // Scroll down : d'abord la sidebar, puis la top bar
            document.body.classList.add("nav-hidden");
            hideTimeoutId = setTimeout(() => {
              header.classList.add("is-hidden");
              hideTimeoutId = null;
            }, 260);
          } else {
            // Scroll up : d'abord la top bar, puis la sidebar
            header.classList.remove("is-hidden");
            showTimeoutId = setTimeout(() => {
              document.body.classList.remove("nav-hidden");
              showTimeoutId = null;
            }, 120);
          }

          headerHidden = hide;
        }
        lastY = y;
      }
      ticking = false;
    });
  });
}

function setLayoutForNamespace(ns) {
  const body = document.body;
  const isHome = ns === "home";
  body.classList.toggle("is-subpage", !isHome);

  const sideNav = ensureSideNav();
  if (!sideNav) return;

  if (isHome) {
    sideNav.style.display = "none";
  } else {
    sideNav.style.display = "";
    setActiveSideNavLink(ns);
  }
}

function ensureSideNav() {
  let sideNav = document.querySelector(".side-nav");
  if (!sideNav) {
    const main = document.querySelector("main");
    if (!main) return null;

    sideNav = document.createElement("aside");
    sideNav.className = "side-nav";
    sideNav.setAttribute("aria-label", "Navigation principale");
    sideNav.innerHTML = `
      <div class="side-nav-inner">
        <a href="a-propos.html" class="side-nav-link">À propos</a>
        <a href="massages.html" class="side-nav-link">Massages</a>
      </div>
    `;

    document.body.insertBefore(sideNav, main);
  }
  return sideNav;
}

function setActiveSideNavLink(ns) {
  const sideNav = document.querySelector(".side-nav");
  if (!sideNav) return;

  const nsToHref = {
    "a-propos": "a-propos.html",
    massages: "massages.html",
    politique: "politique-confidentialite.html",
    mentions: "mentions-legales.html",
  };

  const href = nsToHref[ns];
  const links = sideNav.querySelectorAll(".side-nav-link");
  links.forEach((link) => {
    const linkHref = link.getAttribute("href");
    link.classList.toggle("is-active", !!href && linkHref === href);
  });
}

let currentNamespace = "";
let transitionCleanupId = null;
let burgerLottieInstance = null;

function setupBurgerMenu() {
  const burgerBtn = document.querySelector(".burger-btn");
  const burgerMenu = document.getElementById("burger-menu");
  const lottieContainer = document.getElementById("burger-lottie-container");
  const menuLinks = document.querySelectorAll(".burger-menu-link, .burger-menu-btn");

  if (!burgerBtn || !burgerMenu) return;

  if (lottieContainer && typeof lottie !== "undefined") {
    burgerLottieInstance = lottie.loadAnimation({
      container: lottieContainer,
      renderer: "svg",
      loop: false,
      autoplay: false,
      path: "assets/lottie/Burger%20menu.json",
    });
    if (burgerLottieInstance) {
      const syncLottieSpeed = () => {
        const totalFrames = burgerLottieInstance.totalFrames || 60;
        const frameRate = burgerLottieInstance.frameRate || 30;
        const baseDuration = totalFrames / frameRate;
        const menuDuration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--burger-menu-duration").trim()) || 0.7;
        burgerLottieInstance.setSpeed(baseDuration / menuDuration);
      };
      if (burgerLottieInstance.totalFrames) syncLottieSpeed();
      else burgerLottieInstance.addEventListener("DOMLoaded", syncLottieSpeed);
    }
  }

  function getMenuDuration() {
    return (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--burger-menu-duration").trim()) || 0.7) * 1000;
  }

  function closeBurgerMenu() {
    burgerMenu.classList.remove("is-open");
    burgerBtn.setAttribute("aria-expanded", "false");
    burgerBtn.setAttribute("aria-label", "Ouvrir le menu");
    if (burgerLottieInstance) {
      burgerLottieInstance.setDirection(-1);
      burgerLottieInstance.play();
    }
    setTimeout(() => {
      document.body.classList.remove("burger-menu-open");
      updateNavbarAtTop();
    }, getMenuDuration());
  }

  const NAVBAR_TRANSITION_DELAY = 280;

  burgerBtn.addEventListener("click", () => {
    const willOpen = !burgerMenu.classList.contains("is-open");
    const fromTransparent = document.body.classList.contains("navbar-at-top");

    if (willOpen && fromTransparent) {
      document.body.classList.remove("navbar-at-top");
      setTimeout(() => {
        burgerMenu.classList.add("is-open");
        document.body.classList.add("burger-menu-open");
        burgerBtn.setAttribute("aria-expanded", "true");
        burgerBtn.setAttribute("aria-label", "Fermer le menu");
        if (burgerLottieInstance) {
          burgerLottieInstance.goToAndStop(0, true);
          burgerLottieInstance.setDirection(1);
          burgerLottieInstance.play();
        }
      }, NAVBAR_TRANSITION_DELAY);
    } else if (willOpen) {
      burgerMenu.classList.add("is-open");
      document.body.classList.add("burger-menu-open");
      burgerBtn.setAttribute("aria-expanded", "true");
      burgerBtn.setAttribute("aria-label", "Fermer le menu");
      if (burgerLottieInstance) {
        burgerLottieInstance.goToAndStop(0, true);
        burgerLottieInstance.setDirection(1);
        burgerLottieInstance.play();
      }
    } else {
      burgerMenu.classList.remove("is-open");
      burgerBtn.setAttribute("aria-expanded", "false");
      burgerBtn.setAttribute("aria-label", "Ouvrir le menu");
      if (burgerLottieInstance) {
        burgerLottieInstance.setDirection(-1);
        burgerLottieInstance.play();
      }
      setTimeout(() => {
        document.body.classList.remove("burger-menu-open");
        updateNavbarAtTop();
      }, getMenuDuration());
    }
  });

  menuLinks.forEach((link) => {
    link.addEventListener("click", closeBurgerMenu);
  });
}

function setupFooterReveal() {
  const footer = document.querySelector(".site-footer");
  const main = document.querySelector("main");
  if (!footer || !main) return;

  const isMobile = () => window.innerWidth <= 768 || window.innerHeight <= 600;

  const updateFooterHeight = () => {
    if (isMobile()) {
      document.documentElement.style.setProperty("--footer-height", "0px");
      return;
    }
    const height = footer.offsetHeight;
    document.documentElement.style.setProperty("--footer-height", height + "px");
  };

  updateFooterHeight();

  const resizeObserver = new ResizeObserver(() => {
    updateFooterHeight();
  });
  resizeObserver.observe(footer);

  window.addEventListener("resize", () => {
    updateFooterHeight();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".footer-year, #year").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* Overlay pour masquer le footer pendant les transitions Barba (main remplacé) */
  if (!document.querySelector(".barba-transition-overlay")) {
    const overlay = document.createElement("div");
    overlay.className = "barba-transition-overlay";
    overlay.setAttribute("aria-hidden", "true");
    document.body.appendChild(overlay);
  }

  /* Masquer footer au clic (capture) pour éviter le flash avant beforeLeave */
  document.addEventListener(
    "click",
    (e) => {
      const a = e.target.closest('a[href]');
      if (!a || a.target === "_blank") return;
      const href = (a.getAttribute("href") || "").split("#")[0].toLowerCase();
      if (href.startsWith("http") || href.startsWith("mailto:") || !href) return;
      if (href.endsWith(".html") || href === "/" || href === "" || href === "index.html") {
        document.body.classList.add("is-barba-transitioning");
        if (transitionCleanupId) clearTimeout(transitionCleanupId);
        transitionCleanupId = setTimeout(() => {
          document.body.classList.remove("is-barba-transitioning");
          transitionCleanupId = null;
        }, 2000);
      }
    },
    true
  );

  currentNamespace = getNamespace();
  setLayoutForNamespace(currentNamespace);
  setupHeader();
  setupFooterReveal();
  setupBurgerMenu();

  if (currentNamespace === "reserver") {
    ensureCalendlyLoaded(() => {
      if (window.Calendly && typeof Calendly.initInlineWidgets === "function") {
        Calendly.initInlineWidgets();
      }
    });
  }
});

const lenis = new Lenis({ duration: 1.1, smoothWheel: true, smoothTouch: false });

let calendlyLoaded = false;
let calendlyLoading = false;
let calendlyLoadQueue = [];

function ensureCalendlyLoaded(callback) {
  if (window.Calendly && typeof window.Calendly.initInlineWidgets === "function") {
    calendlyLoaded = true;
    callback();
    return;
  }
  calendlyLoadQueue.push(callback);
  if (calendlyLoading) return;
  calendlyLoading = true;
  const script = document.createElement("script");
  script.src = "https://assets.calendly.com/assets/external/widget.js";
  script.async = true;
  script.onload = () => {
    calendlyLoaded = true;
    calendlyLoading = false;
    calendlyLoadQueue.forEach((cb) => cb());
    calendlyLoadQueue = [];
  };
  script.onerror = () => {
    calendlyLoading = false;
    calendlyLoadQueue = [];
  };
  document.head.appendChild(script);
}

let carouselOffset = 0;
let carouselTime = performance.now();
let scrollVelocity = 0;
const CAROUSEL_SPEED = 35;
const CAROUSEL_FACTOR = 0.08;
let aboutCarouselOffset = 0;

function updateNavbarAtTop(scrollY) {
  const y = scrollY ?? window.scrollY ?? document.documentElement.scrollTop ?? 0;
  const ns = getNamespace();
  const isHome = !document.body.classList.contains("is-subpage");
  const isSubpageWithHero = ns === "a-propos" || ns === "massages";
  const excludeTransparent = ns === "reserver";
  const isNarrow = window.innerWidth <= 900;
  const atTop = y < 15;
  document.body.classList.toggle("navbar-at-top", !excludeTransparent && (isHome || isSubpageWithHero) && isNarrow && atTop);
}

function updateMassagesHorizontalScroll(scrollY) {
  const section = document.querySelector(".massages-section");
  const grid = document.querySelector(".massages-grid");
  if (!section || !grid || window.innerWidth > 900) return;

  const y = scrollY ?? window.scrollY ?? document.documentElement.scrollTop ?? 0;
  const vh = window.innerHeight;
  const sectionTop = section.offsetTop;
  const progress = Math.max(0, Math.min(1, (y - sectionTop) / vh));
  const gap = 24;
  const cardWidth = window.innerWidth - 2 * 1.75 * 16 - gap;
  const scrollDistance = cardWidth + gap;
  grid.style.transform = `translate3d(-${progress * scrollDistance}px, 0, 0)`;
}

if (typeof lenis.on === "function") {
  lenis.on("scroll", (e) => {
    scrollVelocity = e.velocity ?? 0;
    const y = typeof e.scroll === "number" ? e.scroll : window.scrollY ?? document.documentElement.scrollTop ?? 0;
    updateNavbarAtTop(y);
    updateMassagesHorizontalScroll(y);
  });
}

window.addEventListener("resize", () => {
  updateNavbarAtTop();
  updateMassagesHorizontalScroll();
});
requestAnimationFrame(() => {
  updateNavbarAtTop();
  updateMassagesHorizontalScroll();
});

let carouselRafActive = false;
let carouselVisible = false;
let aboutCarouselVisible = false;

function onRaf(time) {
  lenis.raf(time);
  if (carouselRafActive) {
    const track = document.querySelector(".carousel-track");
    if (track) {
      const segmentWidth = track.scrollWidth / 4;
      if (segmentWidth > 0) {
        const dt = Math.min((time - carouselTime) / 1000, 0.1);
        carouselTime = time;
        carouselOffset += (CAROUSEL_SPEED + scrollVelocity * CAROUSEL_FACTOR) * dt;
        while (carouselOffset >= segmentWidth) carouselOffset -= segmentWidth;
        track.style.transform = `translate3d(-${carouselOffset}px,0,0)`;
      }
    }

    const aboutTrack = document.querySelector(".about-carousel-track");
    if (aboutTrack) {
      const halfWidth = aboutTrack.scrollWidth / 2;
      if (halfWidth > 0) {
        const dt = Math.min((time - carouselTime) / 1000, 0.1);
        aboutCarouselOffset += (CAROUSEL_SPEED * 0.35 + scrollVelocity * CAROUSEL_FACTOR * 0.35) * dt;
        while (aboutCarouselOffset >= halfWidth) aboutCarouselOffset -= halfWidth;
        aboutTrack.style.transform = `translate3d(-${aboutCarouselOffset}px,0,0)`;
      }
    }
  }
  requestAnimationFrame(onRaf);
}

function updateCarouselRafState() {
  const wasActive = carouselRafActive;
  carouselRafActive = carouselVisible || aboutCarouselVisible;
  if (carouselRafActive && !wasActive) carouselTime = performance.now();
}

let carouselObserver = null;
let observedCarouselSections = [];

function setupCarouselObserver() {
  const carouselSection = document.querySelector(".carousel-section");
  const aboutCarouselSection = document.querySelector(".about-carousel");

  if (carouselObserver) {
    observedCarouselSections.forEach((el) => {
      if (el && el.isConnected) carouselObserver.unobserve(el);
    });
    observedCarouselSections = [];
  }

  carouselVisible = false;
  aboutCarouselVisible = false;
  updateCarouselRafState();

  if (!carouselSection && !aboutCarouselSection) return;

  if (!carouselObserver) {
    carouselObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (el?.classList?.contains("carousel-section")) carouselVisible = entry.isIntersecting;
          else if (el?.classList?.contains("about-carousel")) aboutCarouselVisible = entry.isIntersecting;
        });
        updateCarouselRafState();
      },
      { threshold: 0.1 }
    );
  }

  if (carouselSection) {
    carouselObserver.observe(carouselSection);
    observedCarouselSections.push(carouselSection);
  }
  if (aboutCarouselSection) {
    carouselObserver.observe(aboutCarouselSection);
    observedCarouselSections.push(aboutCarouselSection);
  }
}

setupCarouselObserver();
requestAnimationFrame(onRaf);

function pageEnter(container) {
  return new Promise((resolve) => {
    gsap.fromTo(
      container,
      { autoAlpha: 0, y: 20, filter: "blur(8px)" },
      {
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.65,
        ease: "power2.out",
        onComplete: () => resolve(),
      }
    );
  });
}

function pageLeave(container) {
  return new Promise((resolve) => {
    gsap.to(container, {
      autoAlpha: 0,
      y: -18,
      filter: "blur(10px)",
      duration: 0.45,
      ease: "power2.inOut",
      onComplete: () => resolve(),
    });
  });
}

function animateHomeToSubpageNavbar() {
  const topLinks = document.querySelectorAll(".nav-block-left .nav-link");
  const logo = document.querySelector(".logo-typo img");
  const insta = document.querySelector(".nav-icon-link img");
  const sideNav = document.querySelector(".side-nav");
  const sideLinks = sideNav ? sideNav.querySelectorAll(".side-nav-link") : [];

  if (sideNav) gsap.set(sideNav, { display: "block" });

  const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

  if (topLinks.length) {
    tl.to(topLinks, {
      y: -20,
      opacity: 0,
      duration: 0.45,
      stagger: 0.05,
    });
  }

  if (logo) {
    tl.fromTo(
      logo,
      { scale: 1 },
      { scale: 1.2, duration: 0.6 },
      0
    );
  }

  if (insta) {
    tl.fromTo(
      insta,
      { scale: 1 },
      { scale: 1.15, duration: 0.6 },
      0
    );
  }

  if (sideNav) {
    tl.fromTo(
      sideNav,
      { x: -60, autoAlpha: 0 },
      { x: 0, autoAlpha: 1, duration: 0.6 },
      "-=0.15"
    );

    if (sideLinks.length) {
      tl.fromTo(
        sideLinks,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.06 },
        "-=0.25"
      );
    }
  }

  return new Promise((resolve) => tl.eventCallback("onComplete", resolve));
}

function animateSubpageToHomeNavbar() {
  const topLinks = document.querySelectorAll(".nav-block-left .nav-link");
  const logo = document.querySelector(".logo-typo img");
  const insta = document.querySelector(".nav-icon-link img");
  const sideNav = document.querySelector(".side-nav");
  const sideLinks = sideNav ? sideNav.querySelectorAll(".side-nav-link") : [];

  const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

  if (sideLinks.length) {
    tl.to(sideLinks, {
      opacity: 0,
      y: -20,
      duration: 0.4,
      stagger: 0.06,
    });
  }

  if (sideNav) {
    tl.to(
      sideNav,
      { x: -60, autoAlpha: 0, duration: 0.5 },
      0
    );
  }

  if (logo) {
    tl.fromTo(
      logo,
      { scale: 1.2 },
      { scale: 1, duration: 0.6 },
      0
    );
  }

  if (insta) {
    tl.fromTo(
      insta,
      { scale: 1.15 },
      { scale: 1, duration: 0.6 },
      0
    );
  }

  if (topLinks.length) {
    tl.fromTo(
      topLinks,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, stagger: 0.06 },
      "-=0.15"
    );
  }

  return new Promise((resolve) => tl.eventCallback("onComplete", resolve));
}

barba.init({
  transitions: [{
    name: "default",
    beforeLeave() {
      document.body.classList.add("is-barba-transitioning");
      const burgerMenu = document.getElementById("burger-menu");
      const burgerBtn = document.querySelector(".burger-btn");
      if (burgerMenu && burgerMenu.classList.contains("is-open")) {
        burgerMenu.classList.remove("is-open");
        if (burgerBtn) burgerBtn.setAttribute("aria-expanded", "false");
        if (burgerLottieInstance) {
          burgerLottieInstance.setDirection(-1);
          burgerLottieInstance.play();
        }
        const duration = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--burger-menu-duration").trim()) || 0.7) * 1000;
        setTimeout(() => {
          document.body.classList.remove("burger-menu-open");
          updateNavbarAtTop();
        }, duration);
      }
    },
    async leave({ current, next }) {
      const fromNs = current.namespace || "";
      const toNs = next && next.namespace ? next.namespace : "";

      if (fromNs === "home" && toNs && toNs !== "home") {
        await animateHomeToSubpageNavbar();
      } else if (fromNs !== "home" && toNs === "home") {
        await animateSubpageToHomeNavbar();
      }

      await pageLeave(current.container);
    },
    async enter({ next }) {
      lenis.scrollTo(0, { immediate: true });
      await pageEnter(next.container);
    },
    afterEnter({ next }) {
      if (transitionCleanupId) {
        clearTimeout(transitionCleanupId);
        transitionCleanupId = null;
      }
      document.body.classList.remove("is-barba-transitioning");
      const ns = next && next.namespace ? next.namespace : "";
      currentNamespace = ns;
      setLayoutForNamespace(ns);
      lenis.scrollTo(0, { immediate: true });

      setupCarouselObserver();

      // Décaler updateNavbarAtTop pour que Lenis/DOM ait le temps de se mettre à jour après la transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          updateNavbarAtTop(0);
        });
      });
      updateMassagesHorizontalScroll();

      // Initialiser Calendly sur la page de réservation après transition Barba
      if (ns === "reserver") {
        ensureCalendlyLoaded(() => {
          if (window.Calendly && typeof Calendly.initInlineWidgets === "function") {
            Calendly.initInlineWidgets();
          }
        });
      }
    },
  }],
});
