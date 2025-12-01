'use client'
import { useRef } from 'react'
import { Plane, useVideoTexture } from '@react-three/drei'
import { useThree, extend, useFrame } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

const CCTVMaterial = shaderMaterial(
    {
        uTexture: new THREE.Texture(),
        uTime: 0,
        uColor: new THREE.Color('#ff2a2a'),
        uOpacity: 1.0, // Added Opacity Uniform
    },
    // Vertex
    `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    // Fragment
    `
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uOpacity; // Use Opacity
    varying vec2 vUv;

    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
      vec2 uv = vUv;
      uv.x += sin(uv.y * 50.0 + uTime) * 0.001;
      
      vec4 color = texture2D(uTexture, uv);
      float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      float noise = random(uv + uTime * 2.0) * 0.15;
      float scanline = sin(uv.y * 900.0) * 0.05;
      
      vec3 finalColor = vec3(gray) + uColor * 0.05 + noise - scanline;

      // Apply opacity to alpha channel
      gl_FragColor = vec4(finalColor, uOpacity); 
    }
  `
)

extend({ CCTVMaterial })

export default function HeroVideo() {
    const { viewport } = useThree()
    const materialRef = useRef<any>(null)

    const texture = useVideoTexture('/assets/hero-cctv.mp4', {
        start: true, muted: true, loop: true, crossOrigin: 'Anonymous'
    })

    useFrame(() => {
        if (!materialRef.current) return

        const scrollY = window.scrollY
        const vh = window.innerHeight

        // LOGIC UPDATE:
        // Keep opacity 1.0 until we pass the Title Section (approx 1.5 screens down)
        const fadeStart = vh * 1.5
        const fadeEnd = vh * 2.5 // Fully black by the time we are deep in archives

        let opacity = 1
        if (scrollY > fadeStart) {
            opacity = 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart)
        }
        opacity = Math.max(0, Math.min(1, opacity))

        materialRef.current.uOpacity = opacity
        materialRef.current.uTime += 0.01
    })

    return (
        <Plane args={[viewport.width, viewport.height]} position={[0, 0, -2]}>
            {/* @ts-ignore */}
            <cCTVMaterial ref={materialRef} uTexture={texture} transparent />
        </Plane>
    )
}