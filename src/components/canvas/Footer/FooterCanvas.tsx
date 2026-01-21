'use client'
import { Canvas } from '@react-three/fiber'
import { Suspense, useState, useEffect } from 'react'
import { Preload } from '@react-three/drei'
import FooterScene from './FooterScene'
import { WebGPURenderer } from 'three/webgpu'
import { WebGLRenderer } from 'three'

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
                console.warn('[WebGPU Footer] Initialization failed:', err)
            })
            console.log('[WebGPU Footer] Renderer created')
            return renderer
        } catch (error) {
            console.warn('[WebGPU Footer] Creation failed, falling back to WebGL:', error)
        }
    }

    // Fallback to WebGL
    console.log('[WebGL Footer] Using WebGL renderer')
    return new WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
    })
}

export default function FooterCanvas() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <Canvas
            className="absolute top-0 left-0 w-full h-full"
            dpr={[1, 2]}
            camera={{ position: [0, 0, 10], fov: 35 }}
            gl={createGLRenderer}
        >
            <Suspense fallback={null}>
                <ambientLight intensity={0.5} />
                <FooterScene />
                <Preload all />
            </Suspense>
        </Canvas>
    )
}
