'use client'
import { useRef, useEffect } from 'react'
import { useFrame, useThree, extend } from '@react-three/fiber'
import * as THREE from 'three'
import { shaderMaterial } from '@react-three/drei'

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

declare global {
    namespace JSX {
        interface IntrinsicElements {
            footerMaterial: any
        }
    }
}

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
    const videoRef = useRef<HTMLVideoElement>(null)
    const tempColor = useRef(new THREE.Color())
    const mouseX = useRef(0.5) // Default to center

    // Global mouse tracking
    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            // Normalize X from 0 to 1 based on window width
            mouseX.current = event.clientX / window.innerWidth
        }

        window.addEventListener('mousemove', handleMouseMove)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
        }
    }, [])

    useEffect(() => {
        const video = document.createElement('video')
        video.src = '/assets/burning-field.mp4'
        video.crossOrigin = 'anonymous'
        video.loop = true
        video.muted = true
        video.playsInline = true
        video.preload = 'auto'

        videoRef.current = video

        // Debugging
        video.addEventListener('error', (e) => {
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
        if (meshRef.current?.material) {
            const mat = meshRef.current.material as any
            if (mat.uTexture) mat.uTexture.needsUpdate = true

            // Use the global mouse X
            const x = mouseX.current
            const clampedX = Math.max(0, Math.min(1, x))

            // Map 0-1 to segments
            // 5 colors = 4 segments
            const segmentCount = COLORS.length - 1
            const rawIndex = clampedX * segmentCount
            const index = Math.floor(rawIndex)
            const t = rawIndex - index

            // Handle edge case for x=1
            const safeIndex = Math.min(index, segmentCount - 1)
            const safeT = index >= segmentCount ? 1 : t

            const c1 = COLORS[safeIndex]
            const c2 = COLORS[safeIndex + 1]

            // Lerp into tempColor to avoid creating new objects
            tempColor.current.copy(c1).lerp(c2, safeT)

            // Apply to material
            mat.uTint.copy(tempColor.current)
        }
    })

    return (
        <mesh ref={meshRef} position={[0, 0, 0]}>
            <planeGeometry args={[viewport.width, viewport.height]} />
            <footerMaterial
                toneMapped={false}
                uThreshold={0.6}
                uIntensity={5.0}
            />
        </mesh>
    )
}