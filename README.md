# Shankarya: Kutra Prem

An immersive, cinematic web experience that pushes the boundaries of browser-based storytelling through WebGPU graphics, interactive physics simulations, and scroll-driven narratives.

## Overview

Shankarya is an avant-garde digital artwork that transforms the web browser into a canvas for narrative exploration. Combining cutting-edge WebGL/WebGPU rendering with poetic intent, the project creates an atmospheric journey through archival content, generative visuals, and interactive elements that respond to user engagement.

The title "Kutra Prem" reflects themes of attachment and connection—exploring how digital media can preserve memory, emotion, and cultural heritage through technological means.

## Features

- **WebGPU-Powered Graphics** – Modern GPU rendering with automatic WebGL fallback
- **Scroll-Based Narrative** – Storytelling driven by scroll position and user interaction
- **Physics Simulations** – Realistic rope physics and particle systems
- **3D Archive Tunnel** – Immersive navigation through visual archival content
- **Platform Integration** – Native support for Farcaster and Base blockchain
- **Smooth Animations** – Lenis scrolling, GSAP transitions, and Framer Motion effects
- **Custom Cursor** – Art-directed cursor experience
- **Responsive Design** – Adapts to various screen sizes and devices

## Tech Stack

### Core Framework
- **React 19** – Latest React with enhanced performance
- **TypeScript** – Full type safety across the codebase
- **Vite** – Lightning-fast build tool and dev server

### 3D Graphics
- **Three.js (WebGPU)** – Modern GPU-accelerated 3D rendering
- **React Three Fiber** – React renderer for Three.js
- **React Three Drei** – Essential helpers and abstractions
- **TSL (Three.js Shading Language)** – Shader programming
- **Post-processing** – Bloom, depth of field, and other effects

### Animation & Physics
- **Framer Motion** – Declarative animations
- **GSAP** – Professional-grade animation toolkit
- **Lenis** – Buttery smooth scroll experience
- **Maath** – Mathematical utilities for physics

### Blockchain & Social
- **Farcaster Mini-App SDK** – Social platform integration
- **@coinbase/onchainkit** – On-chain functionality
- **Viem & Wagmi** – Ethereum/Base blockchain tools

### Styling & UI
- **Tailwind CSS** – Utility-first styling
- **Custom CSS Variables** – Design tokens for theming

## Project Structure

```
shankarya/
├── public/
│   └── assets/              # Static assets (gitignored, hosted on S3)
├── scripts/
│   ├── upload-to-s3.js      # S3 asset upload script
│   └── verify-s3.js         # S3 bucket verification
├── src/
│   ├── app/                 # Page routes
│   │   ├── page.tsx         # Main landing experience
│   │   ├── privacy/         # Privacy policy
│   │   ├── terms/           # Terms of service
│   │   └── layout.tsx       # Root layout wrapper
│   ├── components/
│   │   ├── canvas/          # Three.js/WebGPU components
│   │   │   ├── Scene.tsx    # Main 3D scene container
│   │   │   ├── CameraRig.tsx # Camera controls
│   │   │   ├── Hero/        # Hero section (video textures)
│   │   │   ├── Archives/    # Archive tunnel 3D
│   │   │   ├── Gallery/     # 3D gallery components
│   │   │   ├── Footer/      # Footer burning field scene
│   │   │   ├── Latch/       # 3D lock mechanism
│   │   │   └── Trailing/    # Scroll-follow effects
│   │   └── dom/             # DOM/UI components
│   │       ├── Cursor.tsx   # Custom cursor
│   │       ├── RopeCanvas.tsx # Rope physics display
│   │       ├── VideoModal.tsx # Film viewer modal
│   │       ├── Credits.tsx  # Team credits display
│   │       └── GradientCarousel/ # Media carousel
│   ├── lib/
│   │   ├── webgpu/          # WebGPU initialization
│   │   ├── getAssetUrl.ts   # S3 CDN asset resolver
│   │   ├── useMiniApp.ts    # Platform detection
│   │   ├── useDocumentMeta.ts # SEO metadata
│   │   └── store/           # Zustand state management
│   ├── types/               # TypeScript definitions
│   ├── App.tsx              # Root app component
│   └── main.tsx             # Entry point
├── .env.local               # Environment variables (not committed)
├── netlify.toml             # Netlify deployment config
├── tailwind.config.ts       # Tailwind customization
├── tsconfig.json            # TypeScript config
└── vite.config.ts           # Vite build configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/mehulmehul1/shankarya.git
cd shankarya

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file with:

```env
# AWS S3 for asset hosting
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=shankarya-assets-2025

# Asset CDN URL (production)
VITE_ASSET_BASE_URL=https://shankarya-assets-2025.s3.us-east-1.amazonaws.com
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Asset Management

Assets are hosted on AWS S3 for optimal CDN performance:

```bash
# Upload all assets to S3
npm run s3:upload

# Verify S3 bucket contents
npm run s3:verify
```

## Key Components

### Scene Architecture

The main 3D scene (`src/components/canvas/Scene.tsx`) orchestrates all WebGL content:

- **Camera Rig** – Smooth camera movements with scroll-linked position
- **Hero Section** – Video-textured 3D elements with CCTV aesthetic
- **Archive Tunnel** – Navigable 3D tunnel displaying archival images
- **Footer Scene** – Burning field video with atmospheric effects

### Interactive Elements

**Latch Lock Mechanism**
- Central interactive element requiring user engagement to proceed
- Combines 2D and 3D rendering for seamless integration
- Serves as a metaphor for "unlocking" the experience

**Rope Physics**
- Real-time simulation using Maath physics library
- Visual representation of connection and tension
- Responds to scroll position and user interaction

**Trailing Images**
- Scroll-following archival content
- Creates layered depth effect
- Fades based on viewport position

### Platform Integration

**Farcaster Mini-App**
- Detects Farcaster iframe context
- Provides native share and close functionality
- Displays platform indicator badge

**Base Blockchain**
- Web3 wallet connection support
- Channel token-based access control
- On-chain interaction capabilities

## Artistic Vision

Shankarya explores themes of memory, archive, and digital preservation. The aesthetic draws from:

- **Archival Imagery** – References to Mnemonics and historical documents
- **Monochromatic Palette** – Black, white, with strategic red accents
- **Paper Textures** – Aged document aesthetics in digital form
- **Generative Art** – Algorithmic visuals that evolve with interaction

The 17-minute central film (`film.mp4`) serves as the narrative core, accessible through the video modal and experienced within the immersive environment.

## Deployment

### Netlify

The project is configured for Netlify deployment:

```bash
# Deploy to Netlify
netlify deploy --prod
```

### Environment Configuration

Production uses S3-hosted assets. Ensure `VITE_ASSET_BASE_URL` is set in your deployment environment.

## Asset Hosting

All static assets are hosted on AWS S3 (`shankarya-assets-2025` bucket) for:

- **Global CDN delivery** via CloudFront
- **Optimized loading** with proper caching headers
- **Scalability** for high-traffic scenarios

Asset paths are resolved through `getAssetUrl()` which automatically:
1. Checks for S3 configuration
2. Constructs proper CDN URLs
3. Falls back to local paths in development

## Browser Support

- **Recommended**: Chrome 113+, Edge 113+ (WebGPU support)
- **Fallback**: Firefox, Safari (WebGL renderer)
- **Mobile**: iOS Safari, Chrome Mobile (WebGL)

## Contributing

This is an artistic project. Contributions that align with the vision are welcome.

## Credits

- **Direction & Concept** – Mehul Srivastava
- **Music** – Bobby Socx
- **Art Direction** – Deepesh Baisla, Yashika Sharma, Sahil Sablania
- **Technical Direction** – Mehul Srivastava

## License

Copyright © 2025 Shankarya. All rights reserved.

---

*Built with passion at the intersection of art and technology.*
