'use client'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Preload } from '@react-three/drei'
import FooterScene from './FooterScene'

export default function FooterCanvas() {
    return (
        <Canvas
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            dpr={[1, 2]}
            camera={{ position: [0, 0, 10], fov: 35 }}
            gl={{ alpha: true, antialias: true }}
        >
            <Suspense fallback={null}>
                <ambientLight intensity={0.5} />
                <FooterScene />
                <Preload all />
            </Suspense>
        </Canvas>
    )
}
