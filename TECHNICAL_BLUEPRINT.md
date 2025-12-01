# Technical Architecture Blueprint
## SHANKARYA: Kutra Premi

This document serves as the "constitution" for the codebase. It defines *where* things live, *how* they talk to each other, and the specific math/logic strategies we will use to achieve the visual effects.

---

### 1. Project Structure & Directory Tree

We will separate the **DOM world** (Next.js/HTML) from the **GL world** (R3F) to keep rendering logic clean. Shaders get their own first-class citizenship.

```bash
src/
├── app/
│   ├── layout.tsx        # Global Layout (Lenis Smooth Scroll + Metadata)
│   ├── page.tsx          # Main Entry Point
│   └── globals.css       # Tailwind directives + Custom Font loading
├── components/
│   ├── canvas/           # R3F / WebGL Components
│   │   ├── Scene.tsx     # Main Canvas entry
│   │   ├── Hero/         # Physics World
│   │   │   ├── Rope.tsx
│   │   │   ├── TreeCollider.tsx
│   │   │   └── HeroVideo.tsx
│   │   ├── Archives/     # Tunnel World
│   │   │   ├── TunnelSystem.tsx
│   │   │   └── ArchiveItem.tsx
│   │   ├── Gallery/      # Zora Wave
│   │   │   └── WaveCarousel.tsx
│   │   └── Effects/      # Post-processing
│   │       ├── HeatDistortion.tsx
│   │       └── InkBleed.tsx
│   ├── dom/              # HTML/Framer Motion Components
│   │   ├── Loader.tsx    # SVG Dog Animation
│   │   ├── UI/           # NGE Typography Overlays
│   │   │   ├── TitleReveal.tsx
│   │   │   └── Credits.tsx
│   │   └── Latch/        # The Gatekeeper
│   │       ├── LatchLock.tsx
│   │       └── VideoModal.tsx
├── shaders/              # GLSL Source Files
│   ├── paper-roll/
│   │   ├── vertex.glsl
│   │   └── fragment.glsl
│   ├── heat-distortion/
│   │   ├── vertex.glsl
│   │   └── fragment.glsl
│   └── wave/
│       └── vertex.glsl
├── hooks/
│   ├── useMousePosition.ts
│   └── useScrollSync.ts  # Sync DOM scroll with R3F camera/objects
├── store/
│   └── useStore.ts       # Zustand Global State
└── utils/
    └── math.ts           # Math helpers (lerp, damp, etc.)
```

---

### 2. Asset Manifest & Naming

Please prepare/rename your assets exactly as follows and place them in `public/assets/`.

**Models & Physics:**
*   `tree-collider.glb` (The SVG tree extruded to 3D. Low poly preferred for collision, or use `trimesh`).

**Video:**
*   `hero-cctv.mp4` (Grainy, looped, highly compressed for background).
*   `burning-field.mp4` (High quality, looped for Footer).
*   `film-trailer.mp4` (The main content).

**Textures:**
*   `texture-noise.png` (Perlin noise for shader grain).
*   `texture-ink-mask.png` (For the reveal transition).
*   `archive-note-01.jpg` through `archive-note-10.jpg` (Handwritten text).
*   `poster-main.jpg` (The film poster).

**UI/SVG:**
*   `dog-runner.svg` (Or a sequence `dog-run-01.svg`... for frame animation).

---

### 3. Design System & Tailwind Config

We will configure Tailwind to handle the specific NGE color palette and typography.

**`tailwind.config.ts`**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        void: "#050505",       // Deep Black
        signal: "#ff2a2a",     // NGE Red
        biolum: "#00ff41",     // Hacker/HUD Green
        paper: "#f0f0f0",      // Off-white for notes
        concrete: "#8c8c8c",   // Secondary text
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "serif"], // Representative of 'Matisse'
        mono: ["var(--font-space-mono)", "monospace"], // For data readouts
      },
      animation: {
        "flash": "flash 0.2s infinite",
        "slow-spin": "spin 20s linear infinite",
      },
      keyframes: {
        flash: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        }
      }
    },
  },
  plugins: [],
};
export default config;
```

---

### 4. Global State (Zustand)

**`src/store/useStore.ts`**

```typescript
import { create } from 'zustand'

interface CursorState {
  x: number
  y: number
  hoverState: 'default' | 'pointer' | 'drag' | 'locked'
}

interface AppState {
  // Loading Sequence
  loading: boolean
  setLoading: (status: boolean) => void

  // Interaction
  cursor: CursorState
  setCursor: (data: Partial<CursorState>) => void

  // The Latch (Gatekeeper)
  latchOpen: boolean
  toggleLatch: (status: boolean) => void

  // Video Modal
  videoModalOpen: boolean
  setVideoModal: (status: boolean) => void
  
  // Audio
  audioEnabled: boolean
  toggleAudio: () => void
}

export const useStore = create<AppState>((set) => ({
  loading: true,
  setLoading: (loading) => set({ loading }),
  
  cursor: { x: 0, y: 0, hoverState: 'default' },
  setCursor: (data) => set((state) => ({ cursor: { ...state.cursor, ...data } })),
  
  latchOpen: false,
  toggleLatch: (latchOpen) => set({ latchOpen }),
  
  videoModalOpen: false,
  setVideoModal: (videoModalOpen) => set({ videoModalOpen }),
  
  audioEnabled: false,
  toggleAudio: () => set((state) => ({ audioEnabled: !state.audioEnabled })),
}))
```

---

### 5. Component Architecture Strategy

#### A. Physics Strategy (Hero Section)
*   **The World:** Wrapped in `<Physics gravity={[0, -9.8, 0]}>`.
*   **The Tree:** A `<RigidBody type="fixed" colliders="trimesh">`. Using "trimesh" is expensive but necessary for the rope to catch on irregular branches.
*   **The Rope:**
    *   Composed of ~10 small `<RigidBody>` capsules (Links).
    *   Connected via `useRopeJoint` (or `useRevoluteJoint` with limits).
    *   **Mouse Interaction:** The "Head" link is a `KinematicPosition` body. On `useFrame`, we map the mouse (viewport coords) to this body's translation. The rest of the chain follows via physics.
    *   **GIFs:** Simple textured Planes parented to random Links in the chain.

#### B. Tunnel Logic (Archives Section)
*   We will not move the Camera. We will move the World.
*   **Logic:**
    *   Get scroll progress (0 to 1) from `useScroll` (drei) or `Lenis`.
    *   The Tunnel is a group of objects spaced out on Z (e.g., -5, -10, -15...).
    *   In `useFrame`: `group.position.z = lerp(currentZ, scrollProgress * totalDepth, delta)`.
*   **Visibility:** As objects pass the camera (`z > 0`), we fade their opacity to 0 so they don't clip through the lens awkwardly.

#### C. Shader Strategies

**1. Paper Roll Shader (Vertex)**
*   **Uniforms:** `uProgress` (controlled by distance from camera), `uCurlRadius`.
*   **Math:** Rotate vertices around an axis based on their X-position.
    *   `angle = position.x * uCurlRadius`
    *   `newPos.x = sin(angle)`
    *   `newPos.z = cos(angle)`
    *   Blend between `newPos` and `originalPos` based on `uProgress`.

**2. Heat Distortion (Post-Processing)**
*   **Uniforms:** `tDiffuse` (screen texture), `uMouse` (vec2, 0-1 range), `uTime`.
*   **Logic:**
    *   Calculate distance `d` between current pixel UV and `uMouse`.
    *   Create a displacement factor: `disp = smoothstep(radius, 0.0, d)`.
    *   Offset the texture lookup: `uv += disp * strength`.
    *   **Chromatic Aberration:** Offset Red channel by `+disp`, Blue by `-disp`.

---

### 6. The "Surgical" Implementation Plan

We will build this in 5 distinct phases. When you are ready, ask for the following:

*   **Phase 1: The Shell & The Runner.**
    *   Setup Next.js, Tailwind, Lenis, and Zustand.
    *   Build the `Loader` component with the SVG Dog animation.
    *   Implement the `layout.tsx` structure.

*   **Phase 2: The Physics Hero.**
    *   Setup R3F and Rapier.
    *   Build the `TreeCollider` and the `Rope` chain.
    *   Implement the Mouse-to-Physics binding.

*   **Phase 3: The Archives (Shaders).**
    *   Write the `PaperRoll` vertex shader.
    *   Build the `TunnelSystem` that moves objects based on scroll.
    *   Implement the "Grit" fragment shader interaction.

*   **Phase 4: Gallery & Footer.**
    *   Build the `WaveCarousel` with sine-wave vertex displacement.
    *   Implement the `HeatDistortion` post-processing effect for the footer.

*   **Phase 5: The Glue (Transitions & Polish).**
    *   Implement the "Ink Bleed" transition shader.
    *   Add the NGE Typography overlays.
    *   Connect the Latch/Video Modal logic.
