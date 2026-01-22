'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense, useRef } from 'react'
import { Preload } from '@react-three/drei'
import HeroVideo from './Hero/HeroVideo'
import ArchiveTunnel from './Archives/ArchiveTunnel'
import GifCarousel from './Gallery/GifCarousel'
import CameraRig from './CameraRig'

interface SceneProps {
    showFooter?: boolean
}

// Separate content to use hooks like useThree/useFrame if needed in future
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
            gl={{ antialias: true, alpha: true }}
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
