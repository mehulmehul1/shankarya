'use client'
import { useRef, useEffect } from 'react'
import { useFrame, useThree, extend } from '@react-three/fiber'
import * as THREE from 'three'
import { shaderMaterial } from '@react-three/drei'
import { EffectComposer, Bloom, GodRays } from '@react-three/postprocessing'
import { KernelSize, BlendFunction } from 'postprocessing'
import { getAssetUrl } from '@/lib/getAssetUrl'

const FooterMaterial = shaderMaterial(
    {
        uTexture: new THREE.Texture(),
        uTint: new THREE.Color('#ff5233'),
        uThreshold: 0.6,
        uIntensity: 5.0
    },
    // Vertex Shader
    `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
    // Fragment Shader
    `
    uniform sampler2D uTexture;
    uniform vec3 uTint;
    uniform float uThreshold;
    uniform float uIntensity;
    varying vec2 vUv;

    void main() {
        vec4 tex = texture2D(uTexture, vUv);
        
        // Convert sRGB to Linear
        vec3 linearColor = pow(tex.rgb, vec3(2.2));
        
        float lum = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
        
        // Smoothly isolate the brightest parts
        float factor = smoothstep(uThreshold, 1.0, lum);
        
        // Add the red tint to the bright parts
        linearColor += uTint * factor * uIntensity;
        
        gl_FragColor = vec4(linearColor, tex.a);
    }
    `
)

extend({ FooterMaterial })


const COLORS = [
    new THREE.Color('#33ff33'), // Lime Green
    new THREE.Color('#ff0000'), // Red
    new THREE.Color('#ff00dd'), // Pinkish
    new THREE.Color('#ffff00'), // Yellow
    new THREE.Color('#0000ff'), // Blue
]

export default function FooterScene() {
    const { viewport } = useThree()
    const meshRef = useRef<THREE.Mesh>(null)
    const tempColor = useRef(new THREE.Color())
    const mouse = useRef({ x: 0, y: 0 })

    // Global mouse tracking
    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            // Normalize to -1 to 1
            mouse.current = {
                x: (event.clientX / window.innerWidth) * 2 - 1,
                y: -(event.clientY / window.innerHeight) * 2 + 1
            }
        }

        window.addEventListener('mousemove', handleMouseMove)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
        }
    }, [])

    useEffect(() => {
        const video = document.createElement('video')
        video.src = getAssetUrl('burning-field.mp4')
        video.crossOrigin = 'anonymous'
        video.loop = true
        video.muted = true
        video.playsInline = true
        video.preload = 'auto'

        // Debugging
        video.addEventListener('error', () => {
            console.error('Footer Video Error:', video.error)
        })
        video.addEventListener('loadeddata', () => {
            console.log('Footer Video Loaded')
        })

        const videoTexture = new THREE.VideoTexture(video)
        videoTexture.minFilter = THREE.LinearFilter
        videoTexture.magFilter = THREE.LinearFilter
        videoTexture.colorSpace = THREE.SRGBColorSpace

        if (meshRef.current) {
            const material = meshRef.current.material as any
            material.uTexture = videoTexture
            material.needsUpdate = true
        }

        // Attempt autoplay
        video.play().catch((err) => {
            console.warn('Footer Video Autoplay blocked:', err)
            // Fallback: Play on first interaction
            const playOnClick = () => {
                video.play()
                document.removeEventListener('click', playOnClick)
            }
            document.addEventListener('click', playOnClick)
        })

        return () => {
            video.pause()
            video.src = ''
            video.remove()
            videoTexture.dispose()
        }
    }, [])

    useFrame(() => {
        if (meshRef.current) {
            const mat = meshRef.current.material as any
            if (mat.uTexture) mat.uTexture.needsUpdate = true

            // Dynamic Tint Color
            // Map mouse X (-1 to 1) to 0-1 for color interpolation
            const x = (mouse.current.x + 1) / 2
            const clampedX = Math.max(0, Math.min(1, x))

            const segmentCount = COLORS.length - 1
            const rawIndex = clampedX * segmentCount
            const index = Math.floor(rawIndex)
            const t = rawIndex - index

            const safeIndex = Math.min(index, segmentCount - 1)
            const safeT = index >= segmentCount ? 1 : t

            const c1 = COLORS[safeIndex]
            const c2 = COLORS[safeIndex + 1]

            tempColor.current.copy(c1).lerp(c2, safeT)
            mat.uTint.copy(tempColor.current)
        }
    })

    return (
        <>
            <mesh ref={meshRef} position={[0, 0, 0]}>
                <planeGeometry args={[viewport.width, viewport.height]} />
                {/* @ts-expect-error - footerMaterial is registered via extend() but TS doesn't pick up the type */}
                <footerMaterial
                    toneMapped={false}
                    uThreshold={0.6}
                    uIntensity={5.0}
                />
            </mesh>

            <EffectComposer>
                <Bloom
                    luminanceThreshold={1}
                    luminanceSmoothing={0.025}
                    intensity={0.25}
                    kernelSize={KernelSize.LARGE}
                    mipmapBlur={true}
                />

                <GodRays
                    sun={meshRef as any}
                    blendFunction={BlendFunction.SCREEN}
                    samples={60}
                    density={0.5}
                    decay={0.7}
                    weight={0.3}
                    exposure={0.9}
                    clampMax={1}
                    kernelSize={KernelSize.LARGE}
                    blur={true}
                />

            </EffectComposer>
        </>
    )
}