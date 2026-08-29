# 🏛️ Werkhalle 4 — Raum für Kunst, Workshops & Kultur

Digitaler, kuratierter Webauftritt für die **Werkhalle 4** am Lagerplatz 4 in 93437 Furth im Wald (Oberer Bayerischer Wald).

Das Projekt verbindet das raue Erbe eines ehemaligen Bahn- und Industriegebäudes von 1898 mit zeitgenössischem Kunstatelier-Charme, grenzüberschreitenden Kultur- und Zirkus-Residenzen (*Los Cirkulos*) und einem stilvollen Boutique-Loft für Übernachtungsgäste (*Zu Gast*).

---

## 🚀 Schnellstart & Lokale Entwicklung

Da das Projekt mit modernem Standard-HTML5, Vanilla CSS3 und performantem modularem JavaScript aufgebaut ist, werden keine Build-Tools zwingend benötigt.

### Option 1: Python HTTP-Server
```bash
# Im Projektverzeichnis ausführen:
python -m http.server 8080
```
Danach im Browser aufrufen: **`http://localhost:8080/index.html`**

### Option 2: Node / npx serve
```bash
npx serve .
```

### Option 3: VS Code Live Server
Öffne den Ordner in VS Code und klicke unten rechts auf **„Go Live“**.

---

## 📂 Projekt- und Dateistruktur

```
steffi seite/
├── index.html                               # Haupt-Landingpage (Editorial Luxury, responsive)
├── admin.html                               # Admin-CMS Dashboard (Linear/Apple-Dark UI)
├── README.md                                # Projektdokumentation & Onboarding
├── .gitignore                               # Git Ignore-Regeln
├── assets/
│   └── images/                              # Hochauflösende Original- und Presse-Assets
│       ├── werkhalle_hero_building.jpg      # Hero-Kartenmotiv (Bahngebäude)
│       ├── stephanie_heiduk_atelier.jpg     # Kunstinstallation & Atelieraufnahme
│       ├── stephanie_heiduk_portrait.jpg    # Porträt Stephanie Heiduk
│       ├── werkhalle_entstehung_presse.jpg  # Entstehungsgeschichte
│       ├── residenz_treffpunkt_kuenstler.jpg# Zirkusresidenz / Künstlergruppe
│       ├── pressebild_blumenkunst.jpg       # Blumenkunst / Ikebana
│       ├── pressebild_kreativtreff.webp     # Kreativtreffpunkt
│       └── airbnb_01_*.jpeg bis 07_*.jpeg   # Loft-Interieur, Tafel, Kamin, Schlafzimmer
├── css/
│   ├── tokens.css                           # Design System (Farben, Typografie, Spacings, Schatten)
│   ├── style.css                            # Haupt-Stylesheet mit Section-Layouts
│   ├── admin.css                            # CMS Panel Dark UI Stylesheet
│   ├── ScrollExpand.css                     # Viewport-gesteuerte Frame-Expansion (React Bits)
│   ├── SplitFlapText.css                    # Mechanische Fallblattanzeige 3D-Styles (React Bits)
│   └── TextPressure.css                     # Variable Font Cursor Pressure Styles (React Bits)
└── js/
    ├── app.js                               # Haupt-App (Initialisierung, Filter, Lightbox, Inquiries)
    ├── admin.js                             # CMS State Management (LocalStorage CRUD)
    ├── ScrollExpand.js                      # Vanilla JS Controller für Scroll-Expansion
    ├── ScrollExpand.jsx                     # React Component Source
    ├── SplitFlapText.js                     # Vanilla JS Controller für Fallblattanzeige
    ├── SplitFlapText.jsx                    # React Component Source
    ├── TextPressure.js                      # Vanilla JS Controller für variable Fonts
    └── TextPressure.jsx                     # React Component Source
```

---

## 🌟 Kern-Features & Interaktionen

### 1. Departure Board Hero (`SplitFlapText`)
- Mechanische **Fallblattanzeige** (Flap-Board) angelehnt an historische Bahnhofs-Anzeigetafeln (passend zum Bahngebäude 1898).
- Rotiert flüssig durch Schlagworte: `WERKHALLE 4`, `KUNSTATELIER`, `WORKSHOPS`, `KULTUR RAUM`, `ATELIER LOFT`, `BAHNAREAL 98`.
- Bleibt beim Scrollen elegant im Blickfeld verankert.

### 2. Scroll-Driven Expansion (`ScrollExpand`)
- Startet als fokussierte Karte im Viewport.
- Beim Herunterscrollen weitet sich das Bild mit 60/120fps Lerp-Glättung auf **100% Full-Bleed** aus.
- Blendet bei voller Weite den dunklen Scrim und die schwebenden Raum- und Orts-Badges ein.

### 3. Integriertes CMS-Admin Panel (`admin.html`)
- **Eigenständige Verwaltung** ohne Backend-Zwang via Client-Side Persistence (`LocalStorage`).
- **Workshops & Kurse:** Neue Termine, Formate (z. B. Cyanotypie, Blumenkunst) anlegen, bearbeiten, löschen.
- **Residenzen:** Ankündigung deutsch-tschechischer Künstler- und Zirkus-Residenzen.
- **Galerie:** Kunstwerke kuratieren und zuordnen.
- **Posteingang:** Übermittelte Kurs- und Übernachtungsanfragen direkt im Panel einsehen.

### 4. Veredelte Sektionen
- **Der Ort & Geschichte:** Kuratierte Entstehungsgeschichte von Stephanie Heiduk mit asymmetrischem Editorial-Grid.
- **Workshops & Kurse:** Übersicht mit Filterfunktion und Modal-Anfrage-Flow.
- **Kultur- & Zirkusresidenzen:** Grenzregion Bayern–Böhmen Kulturfokus.
- **Galerie:** Interaktive Filter nach Kategorien + Tastatur-bedienbare Lightbox (`[Esc]`, `[←]`, `[→]`).
- **Zu Gast:** Loft-Präsentation mit Superhost-Badge (4.98★) und Direkt-Anfrage.

---

## 🎨 Design System & Farbwelt

| Variable | Farbton | Verwendung |
|---|---|---|
| `--color-canvas` | `#FAF7F2` | Hintergrund Warm Paper |
| `--color-ink-950` | `#141413` | Primärer Text & Akzente |
| `--color-terracotta` | `#C46D4E` | Klinker- & Terrakotta-Akzente |
| `--color-sand` | `#D9C3A5` | Warmer Naturton / Badges |
| `--color-moss` | `#3D4A3E` | Wald- & Naturakzent |

---

## 🤝 Übergabe & Weiterarbeit

- Alle Komponenten liegen sowohl als **Vanilla JavaScript/CSS** (für sofortige Browser-Ausführung) als auch als **React `.jsx` Komponenten** vor.
- Bei Fragen zu Inhalten siehe auch das Briefing: `Werkhalle vier – Website-Briefing und Content-Grundlage.md`.
