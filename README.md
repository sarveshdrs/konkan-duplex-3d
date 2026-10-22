# 🏡 Chiplun Konkan Duplex House - 3D Architectural Visualizer

> **Interactive 3D Architectural Visualizer & Digital Twin** for a traditional Konkan-style duplex home in Chiplun, Maharashtra, India. Faithfully reconstructed from CAD Floor Plan (**CHIPLUN DESIGN OPT 4 / Drawing A100**) and authentic coastal Konkan exterior architectural styling.

---

## 🌟 Architectural Features

### 1. Ground Floor (G.L. — ~780 ft²)
- **Front Porch (Padwi / Otla):** Left-facade traditional Konkan sit-out supported by carved solid Sagwan (teak) pillars on stone plinths, wrap-around Charupadi bench seating, and continuous sloping roof awning. Fully enclosed on the right by Master Bedroom 1.
- **Double-Height Living Room Mezzanine Void:** 20+ ft soaring vertical volume extending up to exposed timber roof rafters, providing natural stack ventilation for coastal heat and humidity.
- **Pooja Mandir Niche:** Ishanya corner sanctum with carved teak mandir and brass samai lamps.
- **Kitchen & Dining:** Southeast Agneya corner with granite counters, dining area, and a **dedicated teakwood exterior exit door** leading to a 5' × 11' elevated utility platform with descending garden steps ("DN 4 3 2 1").
- **Ground Floor Master Bedroom 1:** Positioned on the front right, aligned flush with the porch front line, eliminating empty setback gaps. Features ashlar stone cladding, multi-pane dark-trimmed casement windows, and exterior sconce lanterns.
- **Bathrooms & Doglegged Staircase:** Attached and common ground-floor bathrooms, and a 20-step doglegged teak staircase.

### 2. First Floor (F.L. — ~780 ft²)
- **Upper Mezzanine Gallery & Passage:** Bridge walkway overlooking the grand living room void below.
- **Bedroom 2 (Master Suite with Private Balcony):**
  - **Private Front Balcony (14' 0" × 5' 0"):** Symmetrically paired with the left balcony, separated by a solid privacy dividing wall, and supported by two carved teak pillars.
  - **European Full-Glass French Door (*Porte-Fenêtre*):** 6' 6" × 6' 8" double-leaf door with floor-to-ceiling clear architectural glass, ultra-slim stiles, astragal muntin bars, and polished brass cremone bolt (*espagnolette*) hardware with active leaf swung open.
  - Master bed centered facing directly out through the French doors to the private balcony.
- **Bedroom 3 (Upper Bedroom Suite with Private Side Balcony):**
  - **Private Side Balcony (5' 0" × 11' 2"):** Positioned directly above the ground-floor kitchen exit door and utility platform, providing weather sheltering below.
  - **European Full-Glass French Door (*Porte-Fenêtre*):** 5' 6" × 6' 8" double-leaf door with full-height clear glass, astragal glazing bars, and dual-sided brass cremone bolts.
  - **Windowless Wall Architecture:** Faithful to CAD Drawing A100, Bedroom 3 has no windows on its side or rear walls, providing quiet thermal insulation and illuminating the space purely through the grand French balcony door.
  - Furnished with outdoor teak bistro seating, flowering bougainvillea planters, and bed headboard against the solid rear wall.

### 3. Roof & Climate-Responsive Architecture
- **38° Steep Sloping Pitch:** Dual-hipped authentic Mangalore terracotta clay tiles engineered for heavy coastal monsoons (>3,500 mm rainfall).
- **Deep 3.5 ft Overhanging Eaves (Chajjas):** Protects exterior plastered walls and open wooden balconies from aggressive driving rains.
- **Ornamental Dormer Vent (*Koodu / Gablette*):** Triangular ventilation louver at the upper balcony ridge apex.
- **Brass Rain Chains (*Kusari*):** Suspended from eave corners down to drainage basins for graceful rainwater management.

---

## 🎮 Interactive Visualizer Controls

- **Orbit Camera:** 1-finger drag (or left-click drag) to orbit around the villa in 360°.
- **Zoom & Pan:** 2-finger pinch (or scroll wheel) to zoom; 2-finger drag (or right-click drag) to pan.
- **Floor Level Switcher:**
  - `Complete House` — Full exterior with terracotta roof.
  - `Roof Off (First Floor)` — Inspect upper bedroom suites, balconies, and mezzanine void.
  - `Ground Floor Only` — Inspect living room, kitchen, porch, and master bedroom.
  - `Exploded Stack` — Exploded architectural elevation separating both floor slabs.
- **Environmental Simulations:**
  - `🌧️ Monsoon Rain` — Real-time particle rain simulation and dynamic roof cascade shedding.
  - `🌅 Golden Hour / Daylight / Night` — Multi-mode sun elevation and shadows.
  - `🔍 X-Ray Wireframe` — Structural inspect mode showing wall frames and internal volumes.
- **Interactive Room Schedule:** Click any room in the sidebar to smoothly fly the camera directly into that space and view architectural dimensions, Vastu orientations, and specifications.

---

## 🚀 How to Run Locally

This project is built using pure **HTML5, CSS3, JavaScript, and Three.js** with zero external build tools or node dependencies required.

```bash
# 1. Clone the repository
git clone https://github.com/sarveshdrs/konkan-duplex-3d.git
cd konkan-duplex-3d

# 2. Start any local web server (e.g. Python)
python3 -m http.server 4321

# 3. Open in your browser
open http://localhost:4321
```

---

## 📱 Mobile & Remote Access

- Fully responsive on **iOS (Safari) and Android (Chrome)** with native touch gestures.
- Can be shared globally over Cloudflare Tunnel:
  ```bash
  cloudflared tunnel --url http://localhost:4321
  ```

---

## 📄 License
Architectural Design & Visualizer © 2026. All rights reserved.
