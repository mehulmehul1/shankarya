'use client'

import { useRef, useMemo } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'

// Gradient background shader
const GradientMaterial = shaderMaterial(
    {
        uTime: 0,
        uColor1: new THREE.Color(0.02, 0.02, 0.02),
        uColor2: new THREE.Color(0.04, 0.04, 0.04),
        uResolution: new THREE.Vector2(1, 1),
    },
    // Vertex shader
    /* glsl */ `
        varying vec2 vUv;
        
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    `,
    // Fragment shader
    /* glsl */ `
        uniform float uTime;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec2 uResolution;
        
        varying vec2 vUv;
        
        void main() {
            // Normalized coordinates
            vec2 uv = vUv;
            vec2 center = vec2(0.5, 0.5);
            
            // Animate gradient centers
            float time = uTime * 0.0002;
            
            // Calculate aspect ratio
            float aspect = uResolution.x / uResolution.y;
            vec2 aspectUv = uv;
            aspectUv.x *= aspect;
            vec2 aspectCenter = center;
            aspectCenter.x *= aspect;
            
            // First gradient blob
            float a1 = min(aspect, 1.0) * 0.35;
            vec2 pos1 = aspectCenter + vec2(cos(time) * a1, sin(time * 0.8) * a1 * 0.4);
            float dist1 = length(aspectUv - pos1);
            float r1 = max(aspect, 1.0) * 0.75;
            float grad1 = smoothstep(r1, 0.0, dist1);
            
            // Second gradient blob
            float a2 = min(aspect, 1.0) * 0.28;
            vec2 pos2 = aspectCenter + vec2(cos(-time * 0.9 + 1.2) * a2, sin(-time * 0.7 + 0.7) * a2 * 0.5);
            float dist2 = length(aspectUv - pos2);
            float r2 = max(aspect, 1.0) * 0.65;
            float grad2 = smoothstep(r2, 0.0, dist2);
            
            // Base dark color
            vec3 color = vec3(0.0);
            
            // Screen blend mode simulation
            vec3 blend1 = uColor1 * grad1 * 0.6;
            vec3 blend2 = uColor2 * grad2 * 0.5;
            
            // Additive blending for glow effect
            color += blend1;
            color += blend2;
            
            gl_FragColor = vec4(color, 1.0);
        }
    `
)

extend({ GradientMaterial })

declare global {
    namespace JSX {
        interface IntrinsicElements {
            gradientMaterial: any
        }
    }
}

interface GradientBackgroundProps {
    colors: {
        r1: number
        g1: number
        b1: number
        r2: number
        g2: number
        b2: number
    }
}

export default function GradientBackground({ colors }: GradientBackgroundProps) {
    const materialRef = useRef<any>(null)

    // Resolution uniform
    const resolution = useMemo(() => {
        return new THREE.Vector2(window.innerWidth, window.innerHeight)
    }, [])

    // Update resolution on resize
    useFrame(() => {
        if (!materialRef.current) return
        materialRef.current.uResolution.set(window.innerWidth, window.innerHeight)
    })

    // Animate colors with GSAP when they change
    useFrame((state) => {
        if (!materialRef.current) return
        materialRef.current.uTime = state.clock.elapsedTime * 1000
    })

    // GSAP color transitions
    useFrame(() => {
        if (!materialRef.current) return

        const targetColor1 = new THREE.Color(
            colors.r1 / 255,
            colors.g1 / 255,
            colors.b1 / 255
        )
        const targetColor2 = new THREE.Color(
            colors.r2 / 255,
            colors.g2 / 255,
            colors.b2 / 255
        )

        // Smooth lerp to target colors
        materialRef.current.uColor1.lerp(targetColor1, 0.05)
        materialRef.current.uColor2.lerp(targetColor2, 0.05)
    })

    return (
        <mesh position={[0, 0, -10]}>
            <planeGeometry args={[2, 2]} />
            <gradientMaterial
                ref={materialRef}
                uResolution={resolution}
            />
        </mesh>
    )
}
