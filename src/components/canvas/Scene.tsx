'use client'
import { Canvas } from '@react-three/fiber'
import { Suspense, useRef, useEffect } from 'react'
import { Preload } from '@react-three/drei'
import HeroVideo from './Hero/HeroVideo'
import ArchiveTunnel from './Archives/ArchiveTunnel'
import GifCarousel from './Gallery/GifCarousel'
import CameraRig from './CameraRig'
import { WebGPURenderer } from 'three/webgpu'
import { WebGLRenderer } from 'three'

interface SceneProps {
    showFooter?: boolean
}

// Custom renderer creation that supports WebGPU with fallback
function createGLRenderer(props: Record<string, unknown>) {
    const canvas = props.canvas as HTMLCanvasElement | null
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
        throw new Error('Canvas element is required')
    }

    // Check if WebGPU is available
    if ('gpu' in navigator) {
        try {
            const renderer = new WebGPURenderer({
                canvas,
                antialias: true,
                alpha: true,
                powerPreference: 'high-performance',
            })
            // Init asynchronously - renderer will work after init completes
            renderer.init().catch((err) => {
                console.warn('[WebGPU] Initialization failed:', err)
            })
            console.log('[WebGPU] Renderer created')
            return renderer
        } catch (error) {
            console.warn('[WebGPU] Creation failed, falling back to WebGL:', error)
        }
    }

    // Fallback to WebGL
    console.log('[WebGL] Using WebGL renderer')
    return new WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
    })
}

// Separate the content to use hooks like useThree/useFrame if needed in future
function SceneContent() {
    return (
        <>
            <ArchiveTunnel />
            <HeroVideo />
        </>
    )
}

export default function Scene(props: SceneProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // Remove this wheel handler since carousel handles its own scroll

    return (
        <Canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-auto"
            dpr={[1, 2]}
            camera={{ position: [0, 0, 10], fov: 35 }}
            gl={createGLRenderer}
        >
            <Suspense fallback={null}>
                <CameraRig active={false} />

                <ambientLight intensity={0.5} />

                <SceneContent />

                <Preload all />
            </Suspense>
        </Canvas>
    )
}