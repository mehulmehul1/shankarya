'use client'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Preload } from '@react-three/drei'
import HeroVideo from './Hero/HeroVideo'
import ArchiveTunnel from './Archives/ArchiveTunnel'
import GifCarousel from './Gallery/GifCarousel'
import CameraRig from './CameraRig'

interface SceneProps {
    showCarousel?: boolean
    scrollProgress?: number
}

// Separate the content to use hooks like useThree/useFrame if needed in future
function SceneContent({
    showCarousel,
}: SceneProps) {
    return (
        <>
            {!showCarousel && (
                <>
                    <ArchiveTunnel />
                    <HeroVideo />
                </>
            )}

            {showCarousel && <GifCarousel />}
        </>
    )
}

export default function Scene(props: SceneProps) {
    return (
        <Canvas
            className="absolute top-0 left-0 w-full h-full pointer-events-auto"
            dpr={[1, 2]}
            camera={{ position: [0, 0, 10], fov: 35 }}
            gl={{ alpha: true, antialias: true }}
        >
            <Suspense fallback={null}>
                <CameraRig active={props.showCarousel} />

                <ambientLight intensity={0.5} />

                <SceneContent {...props} />

                <Preload all />
            </Suspense>
        </Canvas>
    )
}