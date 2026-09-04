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
    const isMobile = window.innerWidth < 768;
    initScrollExpand('#hero-scroll-expand', {
      startWidth: isMobile ? 88 : 56,
      startHeight: isMobile ? 58 : 62,
      startRadius: isMobile ? 20 : 24,
      endRadius: 0,
      mediaZoom: 1.35,
      scrollDistance: isMobile ? 1.0 : 1.2,
      holdDistance: isMobile ? 0.2 : 0.35,
      smoothing: isMobile ? 0 : 0.1,
      overlayScrim: 0.52,
      useWindowScroll: true,
      keepTitleOnScroll: false
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
   BODY SCROLL LOCK MANAGER (iOS & TOUCH BULLETPROOF)
   -------------------------------------------------------------------------- */
let activeScrollLocks = 0;
let savedScrollY = 0;

function lockBodyScroll() {
  activeScrollLocks++;
  if (activeScrollLocks === 1) {
    savedScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
  }
}

function unlockBodyScroll() {
  activeScrollLocks = Math.max(0, activeScrollLocks - 1);
  if (activeScrollLocks === 0) {
    const html = document.documentElement;
    const prevScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    window.scrollTo({
      top: savedScrollY,
      left: 0,
      behavior: 'instant'
    });
    requestAnimationFrame(() => {
      html.style.scrollBehavior = prevScrollBehavior;
    });
  }
}

/* --------------------------------------------------------------------------
   2. MOBILE NAVIGATION DRAWER & TOUCH INTERACTION
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const drawerCloseBtn = document.getElementById('mobile-drawer-close');
  const navLinks = document.querySelectorAll('.mobile-nav-link');

  if (!toggleBtn || !drawer) return;

  const openDrawer = () => {
    drawer.classList.add('is-open');
    toggleBtn.classList.add('is-open');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('mobile-drawer-is-open');
    lockBodyScroll();
  };

  const closeDrawer = () => {
    drawer.classList.remove('is-open');
    toggleBtn.classList.remove('is-open');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('mobile-drawer-is-open');
    unlockBodyScroll();
  };

  const toggleDrawer = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (drawer.classList.contains('is-open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  };

  toggleBtn.addEventListener('click', toggleDrawer);

  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeDrawer();
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      closeDrawer();
    }
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
   5. FULLSCREEN LIGHTBOX & INTERACTIVE GALLERY VIEWER
   -------------------------------------------------------------------------- */
function initLightbox() {
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  if (!lightbox || !lightboxImg) return;

  let currentIndex = 0;

  const getCards = () => {
    return Array.from(document.querySelectorAll('.stream-card, .fly-card, .parallax-card, .gallery-item'));
  };

  const openLightbox = (index) => {
    const cards = getCards();
    if (!cards.length) return;

    if (index < 0) index = cards.length - 1;
    if (index >= cards.length) index = 0;
    currentIndex = index;

    const card = cards[currentIndex];
    const img = card.querySelector('img');
    const titleEl = card.querySelector('.stream-card-title, .parallax-card-title, h3');
    const descEl = card.querySelector('.stream-card-desc, .parallax-card-desc, p');

    const title = card.getAttribute('data-title') || (titleEl ? titleEl.textContent.trim() : '') || (img ? img.getAttribute('alt') : '');
    const desc = card.getAttribute('data-desc') || (descEl ? descEl.textContent.trim() : '');
    const src = (img && (img.currentSrc || img.getAttribute('src'))) || '';

    if (src) {
      lightboxImg.alt = title;
      if (lightboxImg.src === src && lightboxImg.complete) {
        lightboxImg.style.opacity = '1';
      } else {
        lightboxImg.style.opacity = '0';
        lightboxImg.src = src;
        if (lightboxImg.complete) {
          lightboxImg.style.opacity = '1';
        } else {
          lightboxImg.onload = () => {
            lightboxImg.style.opacity = '1';
          };
        }
      }
    }

    if (lightboxTitle) lightboxTitle.textContent = title;
    if (lightboxDesc) lightboxDesc.textContent = desc;

    if (lightboxCounter) {
      const current = String(currentIndex + 1).padStart(2, '0');
      const total = String(cards.length).padStart(2, '0');
      lightboxCounter.textContent = `${current} / ${total}`;
    }

    lightbox.classList.add('is-active');
    lockBodyScroll();
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-active');
    unlockBodyScroll();
  };

  // Direct click bindings on all cards
  const bindCards = () => {
    const cards = getCards();
    cards.forEach((card, idx) => {
      card.style.cursor = 'pointer';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');

      card.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        openLightbox(idx);
      };

      card.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(idx);
        }
      };
    });
  };

  bindCards();

  // Document-level fallback delegation
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.stream-card, .fly-card, .parallax-card, .gallery-item');
    if (card) {
      const cards = getCards();
      const idx = cards.indexOf(card);
      if (idx >= 0) {
        e.preventDefault();
        openLightbox(idx);
      }
    }
  });

  // Controls
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeLightbox();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openLightbox(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openLightbox(currentIndex + 1);
    });
  }

  // Close on clicking backdrop outside image and controls
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-container') || e.target.classList.contains('lightbox-modal')) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') openLightbox(currentIndex + 1);
    if (e.key === 'ArrowLeft') openLightbox(currentIndex - 1);
  });

  // Touch Swipe for Mobile
  let touchStartX = 0;
  let touchEndX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) openLightbox(currentIndex + 1); // Swipe Left -> Next
      else openLightbox(currentIndex - 1); // Swipe Right -> Prev
    }
  }, { passive: true });
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
    lockBodyScroll();
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

  const closeModal = (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
      e.stopPropagation();
    }
    modal.classList.remove('is-active');
    unlockBodyScroll();
  };

  // Direct trigger listener for immediate response without bubbling issues
  document.querySelectorAll('[data-open-modal="inquiry"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const type = btn.getAttribute('data-inquiry-type') || 'allgemein';
      openModal(type);
    });
  });

  // Delegated fallback
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-open-modal="inquiry"]');
    if (trigger) {
      e.preventDefault();
      e.stopPropagation();
      const type = trigger.getAttribute('data-inquiry-type') || 'allgemein';
      openModal(type);
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      closeModal(e);
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(e);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-active')) {
      closeModal(e);
    }
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
   8. CINEMATIC KINETIC SCROLL ANIMATIONS (DESKTOP 3D & MOBILE SMOOTH 2D)
   -------------------------------------------------------------------------- */
function initCylinderPerspectiveScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const isMobile = window.innerWidth <= 768;

  const targetElements = document.querySelectorAll(
    '.hero-metrics-strip, .press-card, .section-header, .workshop-card, .residency-item, .residency-grid > div, .lodging-card, .amenities-strip, .testimonial-card, .contact-container, .faq-item, .story-quote-unconventional, .story-text-group, .story-visual-stage'
  );

  targetElements.forEach((el) => {
    if (isMobile) {
      // Mobile: Punchy, elegant, distinct spring reveals on viewport enter
      gsap.fromTo(
        el,
        {
          opacity: 0,
          y: 40,
          scale: 0.95
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true
          }
        }
      );
    } else {
      // Desktop: Rich 3D Cylinder Kinetic Perspective
      gsap.set(el, {
        transformPerspective: 800,
        transformOrigin: 'center center',
        force3D: true,
        willChange: 'transform, opacity'
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top 96%',
          end: 'bottom 4%',
          scrub: 0.75,
          invalidateOnRefresh: true
        }
      });

      // Phase 1: Entry from bottom
      tl.fromTo(
        el,
        {
          rotateX: -14,
          scale: 0.86,
          z: -70,
          y: 35,
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
        rotateX: 14,
        scale: 0.86,
        z: -70,
        y: -35,
        opacity: 0.75,
        ease: 'power1.in',
        duration: 0.5
      });
    }
  });
}

/* --------------------------------------------------------------------------
   9. STICKY GRID SCROLL CONTROLLER (THEO PLAWINSKI CODROPS ANIMATION — DESKTOP & MOBILE)
   -------------------------------------------------------------------------- */
function initStickyGridScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const isMobile = window.innerWidth <= 1024;
  const section = document.querySelector('.sticky-grid-section');
  const container = document.querySelector('.sticky-grid-container');
  const textPhase1 = document.querySelector('.sticky-text-phase.phase-1');
  const textPhase2 = document.querySelector('.sticky-text-phase.phase-2');
  const mediaPhase1 = document.querySelector('.sticky-media-phase.media-phase-1');
  const mediaPhase2 = document.querySelector('.sticky-media-phase.media-phase-2');

  if (!section || !container || !textPhase1 || !textPhase2 || !mediaPhase1 || !mediaPhase2) return;

  if (isMobile) {
    // Mobile: Dynamic staggered reveals for story headings and image cards
    const phases = [
      { text: textPhase1, media: mediaPhase1 },
      { text: textPhase2, media: mediaPhase2 }
    ];

    phases.forEach(({ text, media }) => {
      if (text) {
        gsap.fromTo(
          text,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: text,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true
            }
          }
        );
      }
      if (media) {
        const cards = media.querySelectorAll('.sticky-grid-card');
        cards.forEach((card, idx) => {
          gsap.fromTo(
            card,
            { opacity: 0, y: 45 + idx * 12, scale: 0.93 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.85,
              delay: idx * 0.1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 88%',
                toggleActions: 'play none none reverse',
                invalidateOnRefresh: true
              }
            }
          );
        });
      }
    });
    return;
  }

  const col1_p1 = mediaPhase1.querySelector('.sticky-col-1');
  const col2_p1 = mediaPhase1.querySelector('.sticky-col-2');
  const col1_p2 = mediaPhase2.querySelector('.sticky-col-1');
  const col2_p2 = mediaPhase2.querySelector('.sticky-col-2');

  // 3D perspective setup on container
  gsap.set(container, {
    transformPerspective: 1000,
    transformOrigin: 'center center',
    force3D: true
  });

  // Initial hardware accelerated states
  gsap.set(textPhase1, { opacity: 1, yPercent: -50, pointerEvents: 'auto' });
  gsap.set(textPhase2, { opacity: 0, yPercent: -38, pointerEvents: 'none' });
  
  gsap.set(mediaPhase1, { opacity: 1, y: 0, scale: 1, pointerEvents: 'auto' });
  gsap.set(mediaPhase2, { opacity: 0, y: 35, scale: 0.95, pointerEvents: 'none' });

  if (col1_p1) gsap.set(col1_p1, { y: 25 });
  if (col2_p1) gsap.set(col2_p1, { y: -25 });
  if (col1_p2) gsap.set(col1_p2, { y: 25 });
  if (col2_p2) gsap.set(col2_p2, { y: -25 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.4
    }
  });

  // 1. Phase 0: Gentle 3D Cylinder Curve Entry (0.0 -> 0.14)
  tl.fromTo(
    container,
    {
      rotateX: -8,
      scale: 0.92,
      z: -50,
      y: 30,
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
  if (col1_p1) tl.to(col1_p1, { y: -45, ease: 'none', duration: 0.5 }, 0);
  if (col2_p1) tl.to(col2_p1, { y: 45, ease: 'none', duration: 0.5 }, 0);

  // 3. Synchronized Butter-Smooth Transition: Phase 1 Out (0.36 -> 0.56)
  tl.to(
    textPhase1,
    {
      opacity: 0,
      yPercent: -62,
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
      y: -30,
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
      yPercent: -50,
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
  if (col1_p2) tl.to(col1_p2, { y: -45, ease: 'none', duration: 0.5 }, 0.5);
  if (col2_p2) tl.to(col2_p2, { y: 45, ease: 'none', duration: 0.5 }, 0.5);

  // 6. Phase Final: Gentle 3D Cylinder Curve Exit (0.86 -> 1.0)
  tl.to(
    container,
    {
      rotateX: 8,
      scale: 0.92,
      z: -50,
      y: -30,
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
