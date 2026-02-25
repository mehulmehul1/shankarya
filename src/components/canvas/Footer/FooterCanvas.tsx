'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense, useState, useEffect } from 'react'
import FooterScene from './FooterScene'

export default function FooterCanvas() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <Canvas
            className="absolute top-0 left-0 w-full h-full"
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 10], fov: 35 }}
            gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        >
            <Suspense fallback={null}>
                <ambientLight intensity={0.5} />
                <FooterScene />
            </Suspense>
        </Canvas>
    )
}
