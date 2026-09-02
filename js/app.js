/**
 * ==========================================================================
 * WERKHALLE 4 — CLIENT INTERACTIVE APPLICATION
 * With Live CMS Sync from LocalStorage & Real-time Content Rendering
 * ==========================================================================
 */

const STORAGE_KEYS = {
  WORKSHOPS: 'werkhalle4_workshops',
  RESIDENCIES: 'werkhalle4_residencies',
  GALLERY: 'werkhalle4_gallery',
  INQUIRIES: 'werkhalle4_inquiries'
};

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileNav();
  
  if (typeof initSplitFlapText === 'function') {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth < 1200;
    initSplitFlapText('#hero-split-flap', {
      words: [
        'WERKHALLE 4 ',
        'KUNSTATELIER',
        'WORKSHOPS   ',
        'KULTURRAUM  ',
        'ATELIER LOFT',
        'BAHNAREAL 98'
      ],
      flipDuration: 0.14,
      stagger: 0.04,
      cycleDelay: 3400,
      tileColor: '#141413',
      textColor: '#FAF7F2',
      tileRadius: 6,
      gap: isMobile ? 3 : 6,
      fontSize: isMobile ? 24 : (isTablet ? 36 : 46),
      loop: true,
      padTo: 12
    });
  }

  if (typeof initScrollExpand === 'function') {
    initScrollExpand('#hero-scroll-expand', {
      startWidth: window.innerWidth < 768 ? 86 : 56,
      startHeight: window.innerWidth < 768 ? 68 : 62,
      startRadius: 24,
      endRadius: 0,
      mediaZoom: 1.35,
      scrollDistance: 1.2,
      holdDistance: 0.35,
      smoothing: 0.1,
      overlayScrim: 0.52,
      useWindowScroll: true,
      keepTitleOnScroll: true
    });
  }

  syncDynamicContent();
  
  let galleryController = null;
  if (typeof initInfiniteScrollGallery === 'function') {
    galleryController = initInfiniteScrollGallery('#galerie', {
      speedCol1: -28,
      speedCol2: 32,
      speedCol3: -38,
      scrub: 1.2
    });
  }

  initGalleryFilters(galleryController);
  initLightbox();
  initInquiryModal();
  initSmoothScrollSpy();
  initCylinderPerspectiveScroll();
  initStickyGridScroll();
  initPaintbrushInteraction();
});

/* --------------------------------------------------------------------------
   1. STICKY AUTO-HIDING HEADER & SCROLL BEHAVIOR
   -------------------------------------------------------------------------- */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let lastScrollY = window.scrollY;
  const scrollThreshold = 8; // Minimum scroll delta to trigger change

  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    // Background style when scrolled
    if (currentScrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Calculate the end of the first section (unter dem Bild des Werks)
    const heroSection = document.querySelector('.hero-section') || document.querySelector('#start');
    const heroBottom = heroSection ? (heroSection.offsetTop + heroSection.offsetHeight - 120) : window.innerHeight;

    // Always visible while in the first section or if mobile menu is open
    const isDrawerOpen = document.querySelector('.mobile-drawer.is-open');
    if (isDrawerOpen || currentScrollY < heroBottom) {
      header.classList.remove('header-hidden');
      document.body.classList.remove('navbar-is-hidden');
      lastScrollY = currentScrollY;
      return;
    }

    // Only active after scrolling past the first section:
    // Scroll Down -> Hide Header & activate Viewport Edge Curvature
    if (currentScrollY > lastScrollY && currentScrollY - lastScrollY > scrollThreshold) {
      header.classList.add('header-hidden');
      document.body.classList.add('navbar-is-hidden');
    }
    // Scroll Up -> Show Header & deactivate Viewport Edge Curvature
    else if (currentScrollY < lastScrollY && lastScrollY - currentScrollY > scrollThreshold) {
      header.classList.remove('header-hidden');
      document.body.classList.remove('navbar-is-hidden');
    }

    lastScrollY = currentScrollY;
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* --------------------------------------------------------------------------
   2. MOBILE NAVIGATION DRAWER
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const navLinks = document.querySelectorAll('.mobile-nav-link');

  if (!toggleBtn || !drawer) return;

  const toggleDrawer = () => {
    const isOpen = drawer.classList.toggle('is-open');
    toggleBtn.classList.toggle('is-open');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  toggleBtn.addEventListener('click', toggleDrawer);

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('is-open');
      toggleBtn.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });
}

/* --------------------------------------------------------------------------
   3. DYNAMIC CONTENT SYNC (FROM CMS ADMIN)
   -------------------------------------------------------------------------- */
function syncDynamicContent() {
  // Sync Workshops
  const savedWorkshops = localStorage.getItem(STORAGE_KEYS.WORKSHOPS);
  const workshopsContainer = document.querySelector('.workshops-overview-grid');
  if (savedWorkshops && workshopsContainer) {
    try {
      const workshops = JSON.parse(savedWorkshops);
      if (workshops.length > 0) {
        workshopsContainer.innerHTML = workshops.map(ws => {
          const isBooked = !!ws.isBooked;
          return `
            <article class="workshop-card ${isBooked ? 'workshop-card--booked' : ''}">
              <div class="workshop-card-media">
                <img src="${ws.image}" alt="${ws.title}" loading="lazy">
                ${
                  isBooked
                    ? `<span class="workshop-card-badge workshop-badge-booked">Ausgebucht</span>`
                    : `<span class="workshop-card-badge">${ws.category}</span>`
                }
              </div>
              <div class="workshop-card-body">
                <h3>${ws.title}</h3>
                <p>${ws.description}</p>
                <div class="workshop-card-footer">
                  <span style="font-size: 0.8125rem; color: var(--color-ink-500);">
                    ${ws.format} ${isBooked ? '· <strong style="color: var(--color-terracotta);">Ausgebucht</strong>' : ''}
                  </span>
                  <button class="btn btn-subtle ${isBooked ? 'btn-booked' : ''}" data-open-modal="inquiry" data-inquiry-type="${isBooked ? 'Warteliste: ' + ws.title : ws.title}">
                    ${isBooked ? 'Warteliste anfragen' : 'Termin anfragen'}
                  </button>
                </div>
              </div>
            </article>
          `;
        }).join('');
      }
    } catch (e) {
      console.warn('Error parsing dynamic workshops:', e);
    }
  }

  // Sync Gallery into Columns
  const savedGallery = localStorage.getItem(STORAGE_KEYS.GALLERY);
  const col1 = document.querySelector('.parallax-col-1');
  const col2 = document.querySelector('.parallax-col-2');
  const col3 = document.querySelector('.parallax-col-3');
  if (savedGallery && col1 && col2 && col3) {
    try {
      const items = JSON.parse(savedGallery);
      if (items.length > 0) {
        col1.innerHTML = '';
        col2.innerHTML = '';
        col3.innerHTML = '';
        items.forEach((item, idx) => {
          const ratioClass = idx % 3 === 0 ? 'tall' : (idx % 3 === 1 ? 'medium' : 'wide');
          const cardHtml = `
            <div class="parallax-card ${ratioClass}" data-category="${item.category}" data-title="${item.title}" data-desc="${item.description}">
              <span class="parallax-card-badge">${item.category === 'kunst' ? 'Kunst & Residenz' : 'Raum & Interieur'}</span>
              <img src="${item.image}" alt="${item.title}" class="parallax-card-media" loading="lazy">
              <div class="parallax-card-overlay">
                <h3 class="parallax-card-title">${item.title}</h3>
                <p class="parallax-card-desc">${item.description}</p>
                <span class="parallax-card-expand">Großansicht öffnen ↗</span>
              </div>
            </div>
          `;
          if (idx % 3 === 0) col1.innerHTML += cardHtml;
          else if (idx % 3 === 1) col2.innerHTML += cardHtml;
          else col3.innerHTML += cardHtml;
        });
      }
    } catch (e) {
      console.warn('Error parsing dynamic gallery:', e);
    }
  }
}

/* --------------------------------------------------------------------------
   4. GALLERY FILTERING
   -------------------------------------------------------------------------- */
function initGalleryFilters(galleryController) {
  const filterBtns = document.querySelectorAll('.filter-btn');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (galleryController && typeof galleryController.filterCategory === 'function') {
        galleryController.filterCategory(filter);
      } else {
        const cards = document.querySelectorAll('.stream-card, .fly-card, .parallax-card, .gallery-item');
        cards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.35s ease forwards';
          } else {
            card.style.display = 'none';
          }
        });
      }
    });
  });
}

/* --------------------------------------------------------------------------
   5. FULLSCREEN LIGHTBOX
   -------------------------------------------------------------------------- */
function initLightbox() {
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const closeBtn = document.getElementById('lightbox-close');

  if (!lightbox || !lightboxImg) return;

  let currentIndex = 0;

  const getVisibleCards = () => {
    const cards = Array.from(document.querySelectorAll('.stream-card, .fly-card, .parallax-card, .gallery-item'));
    return cards.filter(card => card.style.display !== 'none');
  };

  const openLightbox = (index) => {
    const visibleCards = getVisibleCards();
    if (!visibleCards[index]) return;
    currentIndex = index;
    const card = visibleCards[index];
    const img = card.querySelector('img');
    const title = card.getAttribute('data-title') || '';
    const desc = card.getAttribute('data-desc') || '';

    if (img) lightboxImg.src = img.getAttribute('src');
    if (lightboxTitle) lightboxTitle.textContent = title;
    if (lightboxDesc) lightboxDesc.textContent = desc;

    lightbox.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-active');
    document.body.style.overflow = '';
  };

  document.addEventListener('click', (e) => {
    const card = e.target.closest('.stream-card, .fly-card, .parallax-card, .gallery-item');
    if (card) {
      const visibleCards = getVisibleCards();
      const idx = visibleCards.indexOf(card);
      if (idx >= 0) openLightbox(idx);
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-active')) return;
    const visibleCards = getVisibleCards();
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') {
      currentIndex = (currentIndex + 1) % visibleCards.length;
      openLightbox(currentIndex);
    }
    if (e.key === 'ArrowLeft') {
      currentIndex = (currentIndex - 1 + visibleCards.length) % visibleCards.length;
      openLightbox(currentIndex);
    }
  });
}

/* --------------------------------------------------------------------------
   6. INQUIRY MODAL & LEAD CAPTURE
   -------------------------------------------------------------------------- */
function initInquiryModal() {
  const modal = document.getElementById('inquiry-modal');
  const closeBtn = document.getElementById('inquiry-modal-close');
  const form = document.getElementById('inquiry-form');
  const successMsg = document.getElementById('inquiry-success');

  if (!modal) return;

  const openModal = (inquiryType) => {
    modal.classList.add('is-active');
    document.body.style.overflow = 'hidden';
    if (inquiryType && form) {
      const typeSelect = form.querySelector('#inquiry-type');
      if (typeSelect) {
        // Try matching value or default to first
        let matched = false;
        Array.from(typeSelect.options).forEach(opt => {
          if (opt.value.toLowerCase().includes(inquiryType.toLowerCase()) || inquiryType.toLowerCase().includes(opt.value.toLowerCase())) {
            opt.selected = true;
            matched = true;
          }
        });
        if (!matched) typeSelect.value = 'allgemein';
      }
    }
  };

  const closeModal = () => {
    modal.classList.remove('is-active');
    document.body.style.overflow = '';
  };

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-open-modal="inquiry"]');
    if (trigger) {
      e.preventDefault();
      const type = trigger.getAttribute('data-inquiry-type') || 'allgemein';
      openModal(type);
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const name = form.querySelector('#inquiry-name').value;
      const email = form.querySelector('#inquiry-email').value;
      const type = form.querySelector('#inquiry-type').value;
      const message = form.querySelector('#inquiry-message').value;

      // Save inquiry to localStorage for Admin CMS
      const newInquiry = {
        name,
        email,
        type,
        message,
        date: new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      };

      const existingInquiries = JSON.parse(localStorage.getItem(STORAGE_KEYS.INQUIRIES) || '[]');
      existingInquiries.unshift(newInquiry);
      localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(existingInquiries));

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Wird übermittelt...';
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Anfrage absenden';
        }
        form.reset();
        if (successMsg) {
          successMsg.style.display = 'block';
          setTimeout(() => {
            successMsg.style.display = 'none';
            closeModal();
          }, 2400);
        }
        if (statusMsg) {
          statusMsg.textContent = 'Vielen Dank für Ihre Anfrage! Wir melden uns innerhalb von 24 Stunden bei Ihnen.';
          statusMsg.style.color = 'var(--color-terracotta)';
        }
        setTimeout(closeModal, 2500);
      }, 800);
    });
  }
}

/* --------------------------------------------------------------------------
   6. SMOOTH SCROLL SPY & ANCHOR NAVIGATION
   -------------------------------------------------------------------------- */
function initSmoothScrollSpy() {
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  const sections = document.querySelectorAll('section[id]');

  function updateActiveSpy() {
    const scrollPos = window.scrollY + 120;
    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveSpy, { passive: true });

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#') && targetId.length > 1) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          const targetOffset = targetElement.offsetTop - 70;
          window.scrollTo({
            top: targetOffset,
            behavior: 'smooth'
          });
        }
      }
    });
  });
}

/* --------------------------------------------------------------------------
   8. 3D CYLINDER PERSPECTIVE SCROLL (WARM EDITORIAL KINETIC — DESKTOP & MOBILE)
   -------------------------------------------------------------------------- */
function initCylinderPerspectiveScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const isMobile = window.innerWidth <= 768;

  const targetElements = document.querySelectorAll(
    '.hero-metrics-strip, .press-card, .section-header, .workshop-card, .residency-item, .residency-grid > div, .lodging-card, .amenities-strip, .testimonial-card, .contact-container, .stream-card, .faq-item, .sticky-grid-card, .story-quote-unconventional'
  );

  targetElements.forEach((el) => {
    gsap.set(el, {
      transformPerspective: isMobile ? 600 : 800,
      transformOrigin: 'center center',
      force3D: true,
      willChange: 'transform, opacity'
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: isMobile ? 'top 98%' : 'top 96%',
        end: isMobile ? 'bottom 2%' : 'bottom 4%',
        scrub: isMobile ? 0.8 : 0.75,
        invalidateOnRefresh: true
      }
    });

    // Phase 1: Entry from bottom
    tl.fromTo(
      el,
      {
        rotateX: isMobile ? -7 : -14,
        scale: isMobile ? 0.92 : 0.86,
        z: isMobile ? -35 : -70,
        y: isMobile ? 22 : 35,
        opacity: 0.75
      },
      {
        rotateX: 0,
        scale: 1,
        z: 0,
        y: 0,
        opacity: 1,
        ease: 'power1.out',
        duration: 0.5
      }
    );

    // Phase 2: Exit to top
    tl.to(el, {
      rotateX: isMobile ? 7 : 14,
      scale: isMobile ? 0.92 : 0.86,
      z: isMobile ? -35 : -70,
      y: isMobile ? -22 : -35,
      opacity: 0.75,
      ease: 'power1.in',
      duration: 0.5
    });
  });
}

/* --------------------------------------------------------------------------
   9. STICKY GRID SCROLL CONTROLLER (THEO PLAWINSKI CODROPS ANIMATION — DESKTOP)
   -------------------------------------------------------------------------- */
function initStickyGridScroll() {
  if (window.innerWidth <= 1024 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const section = document.querySelector('.sticky-grid-section');
  const container = document.querySelector('.sticky-grid-container');
  const textPhase1 = document.querySelector('.sticky-text-phase.phase-1');
  const textPhase2 = document.querySelector('.sticky-text-phase.phase-2');
  const mediaPhase1 = document.querySelector('.sticky-media-phase.media-phase-1');
  const mediaPhase2 = document.querySelector('.sticky-media-phase.media-phase-2');

  if (!section || !container || !textPhase1 || !textPhase2 || !mediaPhase1 || !mediaPhase2) return;

  const col1_p1 = mediaPhase1.querySelector('.sticky-col-1');
  const col2_p1 = mediaPhase1.querySelector('.sticky-col-2');
  const col1_p2 = mediaPhase2.querySelector('.sticky-col-1');
  const col2_p2 = mediaPhase2.querySelector('.sticky-col-2');

  // 3D perspective setup on container
  gsap.set(container, {
    transformPerspective: isMobile ? 700 : 1000,
    transformOrigin: 'center center',
    force3D: true
  });

  // Initial hardware accelerated states
  gsap.set(textPhase1, { opacity: 1, yPercent: isMobile ? 0 : -50, pointerEvents: 'auto' });
  gsap.set(textPhase2, { opacity: 0, yPercent: isMobile ? 15 : -38, pointerEvents: 'none' });
  
  gsap.set(mediaPhase1, { opacity: 1, y: 0, scale: 1, pointerEvents: 'auto' });
  gsap.set(mediaPhase2, { opacity: 0, y: isMobile ? 25 : 35, scale: 0.95, pointerEvents: 'none' });

  if (col1_p1) gsap.set(col1_p1, { y: isMobile ? 12 : 25 });
  if (col2_p1) gsap.set(col2_p1, { y: isMobile ? -12 : -25 });
  if (col1_p2) gsap.set(col1_p2, { y: isMobile ? 12 : 25 });
  if (col2_p2) gsap.set(col2_p2, { y: isMobile ? -12 : -25 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: isMobile ? 1.0 : 1.4
    }
  });

  // 1. Phase 0: Gentle 3D Cylinder Curve Entry (0.0 -> 0.14)
  tl.fromTo(
    container,
    {
      rotateX: isMobile ? -6 : -8,
      scale: isMobile ? 0.94 : 0.92,
      z: isMobile ? -30 : -50,
      y: isMobile ? 18 : 30,
      opacity: 0.75
    },
    {
      rotateX: 0,
      scale: 1,
      z: 0,
      y: 0,
      opacity: 1,
      duration: 0.14,
      ease: 'power1.out'
    },
    0
  );

  // 2. Phase 1 Internal Column Parallax Flow (0.0 -> 0.5)
  if (col1_p1) tl.to(col1_p1, { y: isMobile ? -25 : -45, ease: 'none', duration: 0.5 }, 0);
  if (col2_p1) tl.to(col2_p1, { y: isMobile ? 25 : 45, ease: 'none', duration: 0.5 }, 0);

  // 3. Synchronized Butter-Smooth Transition: Phase 1 Out (0.36 -> 0.56)
  tl.to(
    textPhase1,
    {
      opacity: 0,
      yPercent: isMobile ? -15 : -62,
      duration: 0.20,
      ease: 'power2.inOut',
      pointerEvents: 'none'
    },
    0.36
  );

  tl.to(
    mediaPhase1,
    {
      opacity: 0,
      y: isMobile ? -20 : -30,
      scale: 0.96,
      duration: 0.20,
      ease: 'power2.inOut',
      pointerEvents: 'none'
    },
    0.36
  );

  // 4. Synchronized Butter-Smooth Transition: Phase 2 In (0.44 -> 0.64)
  tl.to(
    textPhase2,
    {
      opacity: 1,
      yPercent: isMobile ? 0 : -50,
      duration: 0.20,
      ease: 'power2.inOut',
      pointerEvents: 'auto'
    },
    0.44
  );

  tl.to(
    mediaPhase2,
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.20,
      ease: 'power2.inOut',
      pointerEvents: 'auto'
    },
    0.44
  );

  // 5. Phase 2 Internal Column Parallax Flow (0.5 -> 1.0)
  if (col1_p2) tl.to(col1_p2, { y: isMobile ? -25 : -45, ease: 'none', duration: 0.5 }, 0.5);
  if (col2_p2) tl.to(col2_p2, { y: isMobile ? 25 : 45, ease: 'none', duration: 0.5 }, 0.5);

  // 6. Phase Final: Gentle 3D Cylinder Curve Exit (0.86 -> 1.0)
  tl.to(
    container,
    {
      rotateX: isMobile ? 6 : 8,
      scale: isMobile ? 0.94 : 0.92,
      z: isMobile ? -30 : -50,
      y: isMobile ? -18 : -30,
      opacity: 0.75,
      duration: 0.14,
      ease: 'power1.in'
    },
    0.86
  );
}

/* --------------------------------------------------------------------------
   10. ATELIER PAINTBRUSH TACTILE CLICK SPLASH (DESKTOP ONLY)
   -------------------------------------------------------------------------- */
function initPaintbrushInteraction() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const colors = ['rgba(164, 76, 46, 0.45)', 'rgba(200, 90, 54, 0.40)', 'rgba(212, 175, 55, 0.35)'];

  window.addEventListener('pointerdown', (e) => {
    if (!e.isPrimary) return;
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;

    const splash = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];

    splash.style.cssText = `
      position: fixed;
      left: ${e.clientX}px;
      top: ${e.clientY}px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: ${color};
      filter: blur(1px);
      transform: translate(-50%, -50%) scale(0.4);
      pointer-events: none;
      z-index: 999999;
      opacity: 0.8;
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease-out;
    `;

    document.body.appendChild(splash);

    requestAnimationFrame(() => {
      splash.style.transform = `translate(-50%, -50%) scale(1.4)`;
      splash.style.opacity = '0';
    });

    setTimeout(() => {
      if (splash.parentNode) splash.parentNode.removeChild(splash);
    }, 400);
  });
}
