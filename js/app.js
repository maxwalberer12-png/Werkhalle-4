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
        'KULTUR RAUM ',
        'ATELIER LOFT',
        'BAHNAREAL 98'
      ],
      flipDuration: 0.12,
      stagger: 0.05,
      cycleDelay: 2800,
      charset: 'alphanumeric',
      flipsPerChar: 6,
      tileColor: '#141413',
      textColor: '#FAF7F2',
      tileRadius: 6,
      gap: isMobile ? 3 : 6,
      fontSize: isMobile ? 26 : (isTablet ? 38 : 46),
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
  initGalleryFilters();
  initLightbox();
  initInquiryModal();
  initSmoothScrollSpy();
});





/* --------------------------------------------------------------------------
   1. STICKY HEADER & SCROLL BEHAVIOR
   -------------------------------------------------------------------------- */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
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
        workshopsContainer.innerHTML = workshops.map(ws => `
          <article class="workshop-card">
            <div class="workshop-card-media">
              <img src="${ws.image}" alt="${ws.title}" loading="lazy">
              <span class="workshop-card-badge">${ws.category}</span>
            </div>
            <div class="workshop-card-body">
              <h3>${ws.title}</h3>
              <p>${ws.description}</p>
              <div class="workshop-card-footer">
                <span style="font-size: 0.8125rem; color: var(--color-ink-500);">${ws.format}</span>
                <button class="btn btn-subtle" data-open-modal="inquiry" data-inquiry-type="${ws.title}">
                  Termin anfragen
                </button>
              </div>
            </div>
          </article>
        `).join('');
      }
    } catch (e) {
      console.warn('Error parsing dynamic workshops:', e);
    }
  }

  // Sync Gallery
  const savedGallery = localStorage.getItem(STORAGE_KEYS.GALLERY);
  const galleryGrid = document.querySelector('.gallery-grid');
  if (savedGallery && galleryGrid) {
    try {
      const items = JSON.parse(savedGallery);
      if (items.length > 0) {
        galleryGrid.innerHTML = items.map((item, idx) => {
          const spanClass = idx === 0 ? 'span-8' : (idx === items.length - 1 ? 'span-6' : 'span-4');
          return `
            <div class="gallery-item ${spanClass}" data-category="${item.category}" data-title="${item.title}" data-desc="${item.description}">
              <img src="${item.image}" alt="${item.title}" loading="lazy">
              <div class="gallery-overlay">
                <span class="gallery-overlay-title">${item.title}</span>
                <span class="gallery-overlay-desc">${item.description}</span>
              </div>
            </div>
          `;
        }).join('');
      }
    } catch (e) {
      console.warn('Error parsing dynamic gallery:', e);
    }
  }
}

/* --------------------------------------------------------------------------
   4. GALLERY FILTERING
   -------------------------------------------------------------------------- */
function initGalleryFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.gallery-item');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const currentItems = document.querySelectorAll('.gallery-item');
      currentItems.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          item.style.display = 'block';
          item.style.animation = 'fadeIn 0.3s ease forwards';
        } else {
          item.style.display = 'none';
        }
      });
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

  const getItemsData = () => {
    const galleryItems = document.querySelectorAll('.gallery-item');
    return Array.from(galleryItems).map(item => ({
      src: item.querySelector('img').getAttribute('src'),
      title: item.getAttribute('data-title') || '',
      desc: item.getAttribute('data-desc') || ''
    }));
  };

  const openLightbox = (index) => {
    const itemData = getItemsData();
    if (!itemData[index]) return;
    currentIndex = index;
    const data = itemData[index];
    lightboxImg.src = data.src;
    if (lightboxTitle) lightboxTitle.textContent = data.title;
    if (lightboxDesc) lightboxDesc.textContent = data.desc;
    lightbox.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-active');
    document.body.style.overflow = '';
  };

  document.addEventListener('click', (e) => {
    const galleryItem = e.target.closest('.gallery-item');
    if (galleryItem) {
      const allItems = Array.from(document.querySelectorAll('.gallery-item'));
      const idx = allItems.indexOf(galleryItem);
      if (idx >= 0) openLightbox(idx);
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-active')) return;
    const itemData = getItemsData();
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') {
      currentIndex = (currentIndex + 1) % itemData.length;
      openLightbox(currentIndex);
    }
    if (e.key === 'ArrowLeft') {
      currentIndex = (currentIndex - 1 + itemData.length) % itemData.length;
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
      }, 500);
    });
  }
}

/* --------------------------------------------------------------------------
   7. SMOOTH SCROLL SPY
   -------------------------------------------------------------------------- */
function initSmoothScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 200;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}
