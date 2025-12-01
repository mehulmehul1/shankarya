'use client'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Preload } from '@react-three/drei'
import HeroVideo from './Hero/HeroVideo'
import ArchiveTunnel from './Archives/ArchiveTunnel'
import GifCarousel from './Gallery/GifCarousel'
import FooterScene from './Footer/FooterScene'
import CameraRig from './CameraRig'

interface SceneProps {
    showCarousel?: boolean
    showFooter?: boolean
    scrollProgress?: number
    isFooter?: boolean  // Distinguish if this is THE footer section
}

// Separate the content to use hooks like useThree/useFrame if needed in future
function SceneContent({
    showCarousel,
    showFooter,
}: SceneProps) {
    return (
        <>
            {!showCarousel && !showFooter && (
                <>
                    <ArchiveTunnel />
                    <HeroVideo />
                </>
            )}

            {showCarousel && !showFooter && <GifCarousel />}

            {showFooter && <FooterScene isFooter={true} />}
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
                <CameraRig active={props.showCarousel && !props.showFooter} />

                <ambientLight intensity={0.5} />

                <SceneContent {...props} />

                <Preload all />
            </Suspense>
        </Canvas>
    )
}