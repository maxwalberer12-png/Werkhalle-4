/**
 * ==========================================================================
 * WERKHALLE 4 — ADMIN CMS JAVASCRIPT ENGINE
 * Full LocalStorage State Management & Real-time Site Sync
 * ==========================================================================
 */

const STORAGE_KEYS = {
  WORKSHOPS: 'werkhalle4_workshops',
  RESIDENCIES: 'werkhalle4_residencies',
  GALLERY: 'werkhalle4_gallery',
  INQUIRIES: 'werkhalle4_inquiries'
};

// Default seed data matching our real verified research
const DEFAULT_WORKSHOPS = [
  {
    id: 'ws-1',
    title: 'Cyanotypie: Bilder aus Pflanzen & Licht',
    category: 'Fotogramm & Natur',
    format: 'Tages- & Wochenendkurse',
    image: 'assets/images/stephanie_heiduk_portrait.jpg',
    description: 'Historisches Edeldruckverfahren: Mit gesammelten Pflanzen, UV-Licht und mineralischen Emulsionen entstehen unverwechselbare preußischblaue Unikate.',
    isBooked: false
  },
  {
    id: 'ws-2',
    title: 'Asiatische Blumenkunst & Florale Plastik',
    category: 'Objektkunst',
    format: 'Saisonale Termine',
    image: 'assets/images/pressebild_blumenkunst.jpg',
    description: 'Form, Linie und Reduktion: Gestaltungskurse nach asiatischen Prinzipien und experimenteller Objektkunst mit Naturmaterialien.',
    isBooked: false
  },
  {
    id: 'ws-3',
    title: 'Team-Klausuren & Denkwerkstatt',
    category: 'Klausuren & Retreats',
    format: 'Individuelle Zeiträume',
    image: 'assets/images/airbnb_02_essbereich.jpeg',
    description: 'Rückzugsort für Arbeitsgruppen, Agenturen und Initiativen. Der massive 8-Personen-Tisch und die Werk-Küche bieten die perfekte Klausur-Infrastruktur.',
    isBooked: false
  }
];

const DEFAULT_RESIDENCIES = [
  {
    id: 'res-1',
    title: 'Zirkus-Residenz & Fire & Flow',
    subtitle: 'Bayern & Böhmen',
    image: 'assets/images/residenz_treffpunkt_kuenstler.jpg',
    description: 'Zeitgenössischer Zirkus, Akrobatik und Feuershows in Zusammenarbeit mit Künstlern aus Bayern und Tschechien (z. B. Los Cirkulos).'
  },
  {
    id: 'res-2',
    title: 'Artists in Residence & Skulptur',
    subtitle: 'Freies Atelier',
    image: 'assets/images/stephanie_heiduk_atelier.jpg',
    description: 'Arbeitsaufenthalte für bildende Künstler, Bildhauer und Autoren mit freiem Zugang zu Atelier- und Werkstattflächen.'
  }
];

const DEFAULT_GALLERY = [
  {
    id: 'gal-1',
    title: 'Künstlerbegegnung Werkhalle 4',
    category: 'kunst',
    image: 'assets/images/residenz_treffpunkt_kuenstler.jpg',
    description: 'Austausch und Probenarbeit von Künstlern aus Bayern und Tschechien während der Zirkus-Residency.'
  },
  {
    id: 'gal-2',
    title: 'Florale Installation',
    category: 'kunst',
    image: 'assets/images/pressebild_blumenkunst.jpg',
    description: 'Asiatische Blumenkunst und florale Skulptur in den Hallenräumen.'
  },
  {
    id: 'gal-3',
    title: 'Kaminlounge & Salon',
    category: 'raum',
    image: 'assets/images/airbnb_01_wohnbereich_kamin.jpeg',
    description: 'Wohnbereich mit Kaminofen, botanischer Wandgestaltung und Designermöbeln.'
  },
  {
    id: 'gal-4',
    title: 'Die Tafel & Essbereich',
    category: 'raum',
    image: 'assets/images/airbnb_02_essbereich.jpeg',
    description: 'Massiver Holztisch für gemeinsame Mahlzeiten, Kursrunden und Workshops.'
  },
  {
    id: 'gal-5',
    title: 'Werk-Küche mit Backstein',
    category: 'raum',
    image: 'assets/images/airbnb_03_kueche.jpeg',
    description: 'Voll ausgestattete Küche mit historischem Sichtmauerwerk.'
  }
];

// Initialize Storage
function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.WORKSHOPS)) {
    localStorage.setItem(STORAGE_KEYS.WORKSHOPS, JSON.stringify(DEFAULT_WORKSHOPS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.RESIDENCIES)) {
    localStorage.setItem(STORAGE_KEYS.RESIDENCIES, JSON.stringify(DEFAULT_RESIDENCIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.GALLERY)) {
    localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(DEFAULT_GALLERY));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  initAdminNavigation();
  renderWorkshopsTable();
  renderResidenciesTable();
  renderGalleryGrid();
  renderInquiriesTable();
  initFormHandlers();
});

/* --------------------------------------------------------------------------
   1. NAVIGATION & TABS
   -------------------------------------------------------------------------- */
function initAdminNavigation() {
  const navBtns = document.querySelectorAll('.admin-nav-btn');
  const panes = document.querySelectorAll('.admin-tab-pane');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      navBtns.forEach(b => b.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const target = document.getElementById(targetId);
      if (target) target.classList.add('active');
    });
  });
}

function showToast(message) {
  let toast = document.querySelector('.admin-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'admin-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

/* --------------------------------------------------------------------------
   2. WORKSHOPS CRUD
   -------------------------------------------------------------------------- */
function renderWorkshopsTable() {
  const tbody = document.getElementById('workshops-table-body');
  if (!tbody) return;

  const workshops = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKSHOPS) || '[]');
  tbody.innerHTML = '';

  workshops.forEach(ws => {
    const isBooked = !!ws.isBooked;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="${ws.image}" class="table-img-thumb" alt="${ws.title}"></td>
      <td>
        <strong>${ws.title}</strong><br>
        <span style="font-size: 0.75rem; color: #8C8980;">${ws.category}</span>
      </td>
      <td>${ws.format}</td>
      <td>
        ${
          isBooked
            ? '<span class="admin-status-pill status-booked">🔴 Ausgebucht</span>'
            : '<span class="admin-status-pill status-open">🟢 Plätze frei</span>'
        }
      </td>
      <td style="max-width: 280px; font-size: 0.8125rem; color: #AAA69C;">${ws.description}</td>
      <td style="text-align: right; white-space: nowrap;">
        <button class="admin-btn ${isBooked ? 'admin-btn-outline' : 'admin-btn-warning'}" onclick="toggleWorkshopBooked('${ws.id}')" title="${isBooked ? 'Wieder für Buchungen freigeben' : 'Als ausgebucht markieren'}">
          ${isBooked ? 'Wieder öffnen' : 'Als ausgebucht'}
        </button>
        <button class="admin-btn admin-btn-outline" onclick="editWorkshop('${ws.id}')">Bearbeiten</button>
        <button class="admin-btn admin-btn-danger" onclick="deleteWorkshop('${ws.id}')">Löschen</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.toggleWorkshopBooked = function(id) {
  let workshops = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKSHOPS) || '[]');
  const ws = workshops.find(w => w.id === id);
  if (!ws) return;

  ws.isBooked = !ws.isBooked;
  localStorage.setItem(STORAGE_KEYS.WORKSHOPS, JSON.stringify(workshops));
  renderWorkshopsTable();

  if (ws.isBooked) {
    showToast(`🔴 „${ws.title}“ als AUSGEBUCHT markiert`);
  } else {
    showToast(`🟢 „${ws.title}“ wieder für Buchungen FREIGEGEBEN`);
  }
};

window.deleteWorkshop = function(id) {
  if (!confirm('Diesen Workshop wirklich löschen?')) return;
  let workshops = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKSHOPS) || '[]');
  workshops = workshops.filter(w => w.id !== id);
  localStorage.setItem(STORAGE_KEYS.WORKSHOPS, JSON.stringify(workshops));
  renderWorkshopsTable();
  showToast('Workshop erfolgreich gelöscht');
};

window.editWorkshop = function(id) {
  const workshops = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKSHOPS) || '[]');
  const ws = workshops.find(w => w.id === id);
  if (!ws) return;

  document.getElementById('ws-id').value = ws.id;
  document.getElementById('ws-title').value = ws.title;
  document.getElementById('ws-category').value = ws.category;
  document.getElementById('ws-format').value = ws.format;
  document.getElementById('ws-status').value = ws.isBooked ? 'booked' : 'open';
  document.getElementById('ws-image').value = ws.image;
  document.getElementById('ws-description').value = ws.description;

  document.getElementById('ws-form-title').textContent = 'Workshop bearbeiten';
  document.getElementById('ws-cancel-btn').style.display = 'inline-flex';
  document.getElementById('workshop-form-card').scrollIntoView({ behavior: 'smooth' });
};

/* --------------------------------------------------------------------------
   3. RESIDENCIES CRUD
   -------------------------------------------------------------------------- */
function renderResidenciesTable() {
  const tbody = document.getElementById('residencies-table-body');
  if (!tbody) return;

  const residencies = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESIDENCIES) || '[]');
  tbody.innerHTML = '';

  residencies.forEach(res => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="${res.image}" class="table-img-thumb" alt="${res.title}"></td>
      <td><strong>${res.title}</strong></td>
      <td>${res.subtitle}</td>
      <td style="max-width: 280px; font-size: 0.8125rem; color: #AAA69C;">${res.description}</td>
      <td style="text-align: right;">
        <button class="admin-btn admin-btn-danger" onclick="deleteResidency('${res.id}')">Löschen</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.deleteResidency = function(id) {
  if (!confirm('Diesen Eintrag wirklich löschen?')) return;
  let residencies = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESIDENCIES) || '[]');
  residencies = residencies.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.RESIDENCIES, JSON.stringify(residencies));
  renderResidenciesTable();
  showToast('Residenz-Eintrag gelöscht');
};

/* --------------------------------------------------------------------------
   4. GALLERY MANAGER
   -------------------------------------------------------------------------- */
function renderGalleryGrid() {
  const grid = document.getElementById('admin-gallery-grid');
  if (!grid) return;

  const items = JSON.parse(localStorage.getItem(STORAGE_KEYS.GALLERY) || '[]');
  grid.innerHTML = '';

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'admin-gallery-card';
    card.innerHTML = `
      <div class="admin-gallery-card-img">
        <img src="${item.image}" alt="${item.title}">
      </div>
      <div class="admin-gallery-card-body">
        <h4>${item.title}</h4>
        <p>${item.category === 'kunst' ? 'Kunst & Residenz' : 'Räume & Architektur'}</p>
        <div class="admin-gallery-actions">
          <button class="admin-btn admin-btn-danger" onclick="deleteGalleryItem('${item.id}')">Löschen</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

window.deleteGalleryItem = function(id) {
  if (!confirm('Dieses Galeriebild wirklich entfernen?')) return;
  let items = JSON.parse(localStorage.getItem(STORAGE_KEYS.GALLERY) || '[]');
  items = items.filter(i => i.id !== id);
  localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(items));
  renderGalleryGrid();
  showToast('Galeriebild entfernt');
};

/* --------------------------------------------------------------------------
   5. INQUIRIES INBOX
   -------------------------------------------------------------------------- */
function renderInquiriesTable() {
  const tbody = document.getElementById('inquiries-table-body');
  if (!tbody) return;

  const inquiries = JSON.parse(localStorage.getItem(STORAGE_KEYS.INQUIRIES) || '[]');
  tbody.innerHTML = '';

  if (inquiries.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #7E7B73; padding: 24px;">Noch keine Anfragen eingegangen. Test-Anfragen auf der Hauptseite werden hier live angezeigt.</td></tr>`;
    return;
  }

  inquiries.forEach((inq, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${inq.date || 'Heute'}</td>
      <td><strong>${inq.name}</strong><br><a href="mailto:${inq.email}" style="color: var(--color-terracotta); font-size: 0.75rem;">${inq.email}</a></td>
      <td><span class="tag-pill tag-terracotta">${inq.type}</span></td>
      <td style="max-width: 320px; font-size: 0.8125rem;">${inq.message}</td>
      <td style="text-align: right;">
        <button class="admin-btn admin-btn-outline" onclick="deleteInquiry(${idx})">Erledigt</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.deleteInquiry = function(idx) {
  let inquiries = JSON.parse(localStorage.getItem(STORAGE_KEYS.INQUIRIES) || '[]');
  inquiries.splice(idx, 1);
  localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
  renderInquiriesTable();
  showToast('Anfrage als erledigt archiviert');
};

/* --------------------------------------------------------------------------
   6. FORM HANDLERS
   -------------------------------------------------------------------------- */
function initFormHandlers() {
  // Workshop Form
  const wsForm = document.getElementById('workshop-form');
  if (wsForm) {
    wsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('ws-id').value || 'ws-' + Date.now();
      const title = document.getElementById('ws-title').value;
      const category = document.getElementById('ws-category').value;
      const format = document.getElementById('ws-format').value;
      const isBooked = document.getElementById('ws-status').value === 'booked';
      const image = document.getElementById('ws-image').value || 'assets/images/airbnb_01_wohnbereich_kamin.jpeg';
      const description = document.getElementById('ws-description').value;

      let workshops = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKSHOPS) || '[]');
      const existingIdx = workshops.findIndex(w => w.id === id);

      if (existingIdx >= 0) {
        workshops[existingIdx] = { id, title, category, format, image, description, isBooked };
        showToast('Workshop aktualisiert!');
      } else {
        workshops.push({ id, title, category, format, image, description, isBooked });
        showToast('Neuer Workshop erstellt!');
      }

      localStorage.setItem(STORAGE_KEYS.WORKSHOPS, JSON.stringify(workshops));
      resetWorkshopForm();
      renderWorkshopsTable();
    });
  }

  // Cancel Workshop Edit
  const cancelBtn = document.getElementById('ws-cancel-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', resetWorkshopForm);
  }

  // Residency Form
  const resForm = document.getElementById('residency-form');
  if (resForm) {
    resForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = 'res-' + Date.now();
      const title = document.getElementById('res-title').value;
      const subtitle = document.getElementById('res-subtitle').value;
      const image = document.getElementById('res-image').value || 'assets/images/residenz_treffpunkt_kuenstler.jpg';
      const description = document.getElementById('res-description').value;

      let residencies = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESIDENCIES) || '[]');
      residencies.push({ id, title, subtitle, image, description });
      localStorage.setItem(STORAGE_KEYS.RESIDENCIES, JSON.stringify(residencies));
      
      resForm.reset();
      renderResidenciesTable();
      showToast('Kultur-Residenz hinzugefügt!');
    });
  }

  // Gallery Form
  const galForm = document.getElementById('gallery-form');
  if (galForm) {
    galForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = 'gal-' + Date.now();
      const title = document.getElementById('gal-title').value;
      const category = document.getElementById('gal-category').value;
      const image = document.getElementById('gal-image').value;
      const description = document.getElementById('gal-desc').value;

      let items = JSON.parse(localStorage.getItem(STORAGE_KEYS.GALLERY) || '[]');
      items.push({ id, title, category, image, description });
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(items));

      galForm.reset();
      renderGalleryGrid();
      showToast('Neues Bild in Galerie veröffentlicht!');
    });
  }
}

function resetWorkshopForm() {
  const wsForm = document.getElementById('workshop-form');
  if (wsForm) wsForm.reset();
  document.getElementById('ws-id').value = '';
  document.getElementById('ws-status').value = 'open';
  document.getElementById('ws-form-title').textContent = 'Neuen Workshop anlegen';
  document.getElementById('ws-cancel-btn').style.display = 'none';
}
