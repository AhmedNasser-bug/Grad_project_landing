# Dual Shield & NephroEdge B2B — Web Portal & Landing Domain

## Architectural Overview
This directory contains the corporate web portal, clinical evidence showcase, and interactive Business Model Canvas (BMC) web application for NephroEdge B2B / Dual Shield.

### Tech Stack
- **Framework:** Astro v5 (Static Site Generation / Sub-second load times)
- **Styling:** Tailwind CSS V4 + Cormorant Garamond serif + Plus Jakarta Sans + JetBrains Mono
- **Interactivity:** Alpine.js, GSAP ScrollTrigger, Standalone Canvas Engine

### Key Routes
- `/`: Main Dual Shield landing page & clinical resonance storyboards
- `/bmc`: Embedded Osterwalder 9-box Business Model Canvas (`business-model-canvas.html`)
- `/architecture`: System topology, offline edge symmetry, and 3NF data pipeline
- `/evidence`: Real-world clinical evidence & validation trial summaries
- `/about`: Pharos University engineering team origin and academic advisors
- `/journal`: Field deployment journals & milestone release logs
- `/partner`: Formal pilot request and hospital outreach inquiry gateway

### Development & Build
```bash
# Install dependencies
npm install

# Start local dev server (http://localhost:4321)
npm run dev

# Compile static release into dist/
npm run build
```
