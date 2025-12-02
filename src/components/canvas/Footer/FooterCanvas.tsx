'use client'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Preload } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { KernelSize } from 'postprocessing'
import FooterScene from './FooterScene'

export default function FooterCanvas() {
    return (
        <Canvas
            className="absolute top-0 left-0 w-full h-full"
            dpr={[1, 2]}
            camera={{ position: [0, 0, 10], fov: 35 }}
            gl={{ alpha: true, antialias: true }}
        >
            <Suspense fallback={null}>
                <ambientLight intensity={0.5} />
                <FooterScene />
                <Preload all />

                {/* Postprocessing Effects */}
                <EffectComposer>
                    <Bloom
                        luminanceThreshold={1}
                        luminanceSmoothing={0.025}
                        intensity={0.25}
                        kernelSize={KernelSize.LARGE}
                        mipmapBlur={true}
                    />
                </EffectComposer>
            </Suspense>
        </Canvas>
    )
}
