# Bhraman Sarthi — Refined Yatra Design System

## 1. Visual Identity & Concept: "Yatra" (भ्रमण / यात्रा)

The visual direction is a contemporary Indian travel journal: calm, editorial layouts with warm paper, deep teal, slate indigo, muted terracotta, and small antique-brass details. Cultural references appear as restrained craft details—Devanagari typography, a fine textile-like pattern, or a single folk-art accent—while route information remains the focus.

---

## 2. Design Tokens

### 2.1 Color Palette Table & Contrast Ratios (WCAG 2.2 AA Compliance)

| Token Name | Hex Code | Purpose / Usage | Contrast Ratio on Paper (`#FBF3E4`) | WCAG Pass Status |
| :--- | :--- | :--- | :--- | :--- |
| `paper` | `#F7F5EF` | Quiet warm canvas | Baseline | N/A |
| `paper-deep` | `#EEE9DE` | Soft card fill / section ground | Background | N/A |
| `paper-light` | `#FFFEFA` | Inputs and raised surfaces | Background | N/A |
| `ink` | `#202D30` | Primary text and headings | High contrast | ✅ |
| `ink-soft` | `#506164` | Supporting copy and labels | High contrast | ✅ |
| `vermilion` | `#A64E3C` | Muted terracotta action accent | Accent | ✅ |
| `peacock` | `#23665C` | Teal brand accent and positive states | Accent | ✅ |
| `indigo` | `#344B63` | Slate-indigo links and flight accent | Accent | ✅ |
| `terracotta` | `#A9563E` | Warm craft detail | Accent | ✅ |
| `gold-line` | `#BDA879` | Fine craft details only | Decorative | — |
| `turmeric` | `#C69A4B` | Small highlight accents | Decorative | — |
| `saffron` | `#C5793F` | Warm secondary accent | Accent | ✅ |
| `crimson-alert`| `#8F3937` | Critical states and errors | Accent | ✅ |

### 2.2 Typography Scale

- **Display / Headings**: `Yatra One` / `Tiro Devanagari Hindi` (`font-display`) — Characterful Indic serif for titles and hero section headers.
- **Body & Controls**: `Mukta` / `Noto Sans Devanagari` (`font-sans`) — Highly legible humanist sans-serif with native Devanagari support.
- **Numbers / Metrics**: `tabular-nums` for precise column alignment across prices (`₹12,450`), durations (`3h 45m`), and buffer minutes.

### 2.3 Shadow & Radius Tokens

- **Border Radius**:
  - `rounded-xl`: 12px (small buttons, chips)
  - `rounded-2xl`: 16px (inputs, dropdowns, modal subcards)
  - `rounded-3xl`: 24px (ticket pass cards, main containers)
- **Shadow Scale**:
  - `shadow-yatra-sm`: `0 2px 8px -1px rgba(43, 27, 20, 0.08)`
  - `shadow-yatra-md`: `0 4px 20px -2px rgba(43, 27, 20, 0.10)`
  - `shadow-yatra-lg`: `0 10px 30px -4px rgba(43, 27, 20, 0.14)`

---

## 3. Catalog of Traditional Art Motifs & Inspiration Sources

Each traditional motif in BHRAMAN SARTHI is drawn strictly using inline SVGs or CSS patterns:

1. **Jaali (Jali Lattice Work)**
   - *Inspiration*: Carved geometric stone screens of Mughal and Rajput architecture (Agra, Fatehpur Sikri, Jaipur).
   - *Usage*: Fine header/footer detail where it does not compete with content.
2. **Kolam / Rangoli**
   - *Inspiration*: South Indian ritual floor art featuring dot-grid loops (Tamil Nadu & Kerala).
   - *Usage*: Occasional divider or small route marker, not between every panel.
3. **Madhubani (Mithila Art)**
   - *Inspiration*: Bihar's traditional Mithila painting style using double-line borders and floral corner fills.
   - *Usage*: Small accents; primary cards use clean single-line borders.
4. **Warli Art**
   - *Inspiration*: Tribal stick-figure art of Maharashtra (North Sahyadri region).
   - *Usage*: `<WarliFigure />` figures representing travelers, trains, airplanes, and buses for empty states and illustration panels.
5. **Toran (Arch / Cusped Gateway)**
   - *Inspiration*: Traditional festive doorway arches and Mughal cusped arches.
   - *Usage*: `<ToranArch />` modal headers, section titles, and ticket card tops.
6. **Boota / Ajrakh Block-Print**
   - *Inspiration*: Hand-block printed textile motifs from Gujarat and Rajasthan.
   - *Usage*: Background watermarks and paper grain textures.

---

## 4. Component Design Rules

### Do's:
- ✅ Keep body text contrast above 4.5:1 on warm cream paper backgrounds (`#FBF3E4`).
- ✅ Pair transport modes with clear text labels and icons: Flight (Indigo), Train (Vermilion), Bus (Peacock Green).
- ✅ Keep all interactive elements accessible with visible focus rings (`outline: 3px solid #C8321E`).
- ✅ Ensure touch targets are at least 44x44px.
- ✅ Keep layouts editorial and spacious, with one clear focal point per screen.
- ✅ Use cultural references sparingly alongside quiet neutral surfaces.

### Don'ts:
- ❌ Do NOT use religious symbols (Om, swastika, crosses, crescents) or deity imagery.
- ❌ Do NOT use gold (`#C9A24B`), turmeric (`#E8A317`), or saffron (`#E8731A`) for body text or small text.
- ❌ Do NOT enable dark variants or `dark:` CSS classes (`color-scheme: light` is enforced globally).
- ❌ Do NOT rely solely on color for status indicators (always pair with text and an icon).
